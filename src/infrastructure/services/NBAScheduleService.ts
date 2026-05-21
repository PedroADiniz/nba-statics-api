import axios from 'axios';
import { GameDetail, GameDetailPlayer, GameDetailTeam, ScheduleGame, ScheduleTeam } from '../../domain/entities/ScheduleGame';
import { NBAStatsHttpClient, zipRow } from '../http/NBAStatsHttpClient';
import { logger } from '../../shared/logger/logger';

// CDN full-season schedule 

interface CDNTeam {
  teamId: number;
  teamCity: string;
  teamName: string;
  teamTricode: string;
  wins: number;
  losses: number;
  score: number | null;
}

interface CDNGame {
  gameId: string;
  gameStatus: 1 | 2 | 3;
  gameStatusText: string;
  gameDateEst: string;
  gameDateTimeEst: string;
  homeTeam: CDNTeam;
  awayTeam: CDNTeam;
  postponedStatus?: string;
}

interface CDNResponse {
  leagueSchedule: {
    gameDates: { gameDate: string; games: CDNGame[] }[];
  };
}

const CDN_URL = 'https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let cdnCache: ScheduleGame[] | null = null;
let cdnCachedAt = 0;

// scoreboard cache for live-status refresh (1 min)
const liveCache = new Map<string, { data: ScheduleGame[]; at: number }>();
const LIVE_TTL = 60_000;

function toNBADate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

// NBA CDN stores gameDateTimeEst as Eastern time but with a Z suffix,
// making JS treat it as UTC. This converts it to a real UTC ISO string.
function easternToUtc(gameDateTimeEst: string): string {
  if (!gameDateTimeEst) return '';
  const withoutZ = gameDateTimeEst.replace(/Z$/, '');
  if (!withoutZ.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)) return '';

  const tempUtc = new Date(withoutZ + 'Z');
  if (isNaN(tempUtc.getTime())) return '';

  // Find what Eastern hour tempUtc corresponds to
  const etParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(tempUtc);

  const etHour   = Number(etParts.find((p) => p.type === 'hour')?.value   ?? '0') % 24;
  const etMinute = Number(etParts.find((p) => p.type === 'minute')?.value ?? '0');

  const targetHour   = Number(withoutZ.slice(11, 13));
  const targetMinute = Number(withoutZ.slice(14, 16));

  let diffMinutes = (targetHour * 60 + targetMinute) - (etHour * 60 + etMinute);
  if (diffMinutes >  720) diffMinutes -= 1440;
  if (diffMinutes < -720) diffMinutes += 1440;

  return new Date(tempUtc.getTime() + diffMinutes * 60_000).toISOString();
}

function currentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startYear = month >= 10 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

export class NBAScheduleService {
  constructor(private readonly statsClient: NBAStatsHttpClient) {}

  // Public API 

  async getByDate(date: string): Promise<ScheduleGame[]> {
    const all = await this.getAll();
    const fromCdn = all.filter((g) => g.gameDate === date);

    if (fromCdn.length === 0) return [];

    // If any game is live, refresh scores via scoreboardv2
    const hasLive = fromCdn.some((g) => g.gameStatus === 2);
    const isToday = date === new Date().toISOString().slice(0, 10);

    if (hasLive || isToday) {
      const cached = liveCache.get(date);
      if (cached && Date.now() - cached.at < LIVE_TTL) return cached.data;

      const live = await this.fetchScoreboard(date);
      if (live.length > 0) {
        // Merge live scores back into CDN data (CDN has better names)
        const merged = fromCdn.map((g) => {
          const l = live.find((x) => x.gameId === g.gameId);
          if (!l) return g;
          return {
            ...g,
            gameStatus: l.gameStatus,
            gameStatusText: l.gameStatusText,
            homeTeam: { ...g.homeTeam, score: l.homeTeam.score },
            awayTeam: { ...g.awayTeam, score: l.awayTeam.score },
          };
        });
        liveCache.set(date, { data: merged, at: Date.now() });
        return merged;
      }
    }

    return fromCdn;
  }

  async getAllDates(): Promise<string[]> {
    const all = await this.getAll();
    const set = new Set(all.map((g) => g.gameDate));
    return Array.from(set).sort();
  }

  async getGameDetail(gameId: string): Promise<GameDetail | null> {
    try {
      const response = await this.statsClient.get('/boxscoresummaryv2', {
        GameID: gameId,
      });

      const gameSummaryRS = response.resultSets.find((rs) => rs.name === 'GameSummary');
      const lineScoreRS   = response.resultSets.find((rs) => rs.name === 'LineScore');
      const gameInfoRS    = response.resultSets.find((rs) => rs.name === 'GameInfo');

      if (!gameSummaryRS || !gameSummaryRS.rowSet[0]) return null;

      const summary      = zipRow(gameSummaryRS.headers, gameSummaryRS.rowSet[0]);
      const homeTeamId   = Number(summary['HOME_TEAM_ID']);
      const visitorId    = Number(summary['VISITOR_TEAM_ID']);
      const gameStatus   = Number(summary['GAME_STATUS_ID']) as 1 | 2 | 3;
      const statusText   = String(summary['GAME_STATUS_TEXT'] ?? '').trim();

      const lineRows = (lineScoreRS?.rowSet ?? []).map((r) => zipRow(lineScoreRS!.headers, r));
      const homeLine   = lineRows.find((r) => Number(r['TEAM_ID']) === homeTeamId);
      const awayLine   = lineRows.find((r) => Number(r['TEAM_ID']) === visitorId);

      const all      = await this.getAll();
      const cdnGame  = all.find((g) => g.gameId === gameId);

      const gameInfo = gameInfoRS?.rowSet[0]
        ? zipRow(gameInfoRS.headers, gameInfoRS.rowSet[0])
        : null;

      const buildTeam = (
        line: Record<string, string | number | null> | undefined,
        cdnTeam: ScheduleTeam | undefined,
      ): GameDetailTeam => {
        const parseWL = (wl: string | null): { wins: number; losses: number } => {
          if (!wl) return cdnTeam ? { wins: cdnTeam.wins, losses: cdnTeam.losses } : { wins: 0, losses: 0 };
          const [w, l] = String(wl).split('-').map(Number);
          return { wins: w ?? 0, losses: l ?? 0 };
        };
        const wl = parseWL(line?.['TEAM_WINS_LOSSES'] as string | null);
        const pts = Number(line?.['PTS']) || null;
        return {
          id: Number(line?.['TEAM_ID'] ?? cdnTeam?.id ?? 0),
          city: String(line?.['TEAM_CITY_NAME'] ?? cdnTeam?.city ?? ''),
          name: String(line?.['TEAM_NICKNAME'] ?? cdnTeam?.name ?? ''),
          abbreviation: String(line?.['TEAM_ABBREVIATION'] ?? cdnTeam?.abbreviation ?? ''),
          wins: cdnTeam?.wins ?? wl.wins,
          losses: cdnTeam?.losses ?? wl.losses,
          score: gameStatus > 1 ? pts : null,
          q1: Number(line?.['PTS_QTR1']) || null,
          q2: Number(line?.['PTS_QTR2']) || null,
          q3: Number(line?.['PTS_QTR3']) || null,
          q4: Number(line?.['PTS_QTR4']) || null,
          ot1: Number(line?.['PTS_OT1']) || null,
          ot2: Number(line?.['PTS_OT2']) || null,
          ot3: Number(line?.['PTS_OT3']) || null,
          ot4: Number(line?.['PTS_OT4']) || null,
          fgPct: Number(line?.['FG_PCT']) || null,
          ftPct: Number(line?.['FT_PCT']) || null,
          fg3Pct: Number(line?.['FG3_PCT']) || null,
          assists: Number(line?.['AST']) || null,
          rebounds: Number(line?.['REB']) || null,
        };
      };

      const gameDate = cdnGame?.gameDate
        ?? String(summary['GAME_DATE_EST'] ?? '').slice(0, 10);

      // Fetch player box scores (throttled sequentially)
      const { homePlayers, awayPlayers } = await this.fetchPlayerBoxScore(
        gameId, homeTeamId, visitorId,
      );

      return {
        gameId,
        gameDate,
        gameTimeUtc: cdnGame?.gameTimeUtc ?? '',
        gameStatus,
        gameStatusText: statusText,
        homeTeam: buildTeam(homeLine, cdnGame?.homeTeam),
        awayTeam: buildTeam(awayLine, cdnGame?.awayTeam),
        homePlayers,
        awayPlayers,
        attendance: Number(gameInfo?.['ATTENDANCE']) || null,
        gameDuration: String(gameInfo?.['GAME_TIME'] ?? '').trim() || null,
      };
    } catch (err) {
      logger.warn(`boxscoresummaryv2 failed for ${gameId}: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  }

  private async fetchPlayerBoxScore(
    gameId: string,
    homeTeamId: number,
    awayTeamId: number,
  ): Promise<{ homePlayers: GameDetailPlayer[]; awayPlayers: GameDetailPlayer[] }> {
    try {
      const response = await this.statsClient.get('/boxscoretraditionalv2', {
        GameID: gameId,
        StartPeriod: 0,
        EndPeriod: 10,
        StartRange: 0,
        EndRange: 28800,
        RangeType: 0,
      });

      const playerStatsRS = response.resultSets.find((rs) => rs.name === 'PlayerStats');
      if (!playerStatsRS || playerStatsRS.rowSet.length === 0) {
        return { homePlayers: [], awayPlayers: [] };
      }

      const rows = playerStatsRS.rowSet.map((r) => zipRow(playerStatsRS.headers, r));

      const mapPlayer = (row: Record<string, string | number | null>): GameDetailPlayer => {
        const rawMin = String(row['MIN'] ?? '');
        const minutes = rawMin ? rawMin.split('.')[0] : '';
        return {
          playerId: Number(row['PLAYER_ID']),
          playerName: String(row['PLAYER_NAME'] ?? ''),
          startPosition: String(row['START_POSITION'] ?? ''),
          minutes,
          points: Number(row['PTS']) || 0,
          rebounds: Number(row['REB']) || 0,
          assists: Number(row['AST']) || 0,
          steals: Number(row['STL']) || 0,
          blocks: Number(row['BLK']) || 0,
          turnovers: Number(row['TO']) || 0,
          fgMade: Number(row['FGM']) || 0,
          fgAttempted: Number(row['FGA']) || 0,
          fg3Made: Number(row['FG3M']) || 0,
          fg3Attempted: Number(row['FG3A']) || 0,
          ftMade: Number(row['FTM']) || 0,
          ftAttempted: Number(row['FTA']) || 0,
          plusMinus: Number(row['PLUS_MINUS']) || 0,
        };
      };

      // Exclude DNP players (COMMENT is non-empty) and players with 0 minutes
      const played = rows.filter((r) => !r['COMMENT'] && r['MIN'] && String(r['MIN']) !== '0:00');

      return {
        homePlayers: played.filter((r) => Number(r['TEAM_ID']) === homeTeamId).map(mapPlayer),
        awayPlayers: played.filter((r) => Number(r['TEAM_ID']) === awayTeamId).map(mapPlayer),
      };
    } catch (err) {
      logger.warn(`boxscoretraditionalv2 failed for ${gameId}: ${err instanceof Error ? err.message : err}`);
      return { homePlayers: [], awayPlayers: [] };
    }
  }

  // ── Internal: CDN fetch with leaguegamelog fallback ──────────────────────

  private async getAll(): Promise<ScheduleGame[]> {
    if (cdnCache && Date.now() - cdnCachedAt < CACHE_TTL_MS) return cdnCache;

    // Try CDN
    try {
      const { data } = await axios.get<CDNResponse>(CDN_URL, {
        timeout: 15_000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.nba.com/',
          'Origin': 'https://www.nba.com',
        },
      });

      const games: ScheduleGame[] = [];
      for (const dateEntry of data.leagueSchedule.gameDates) {
        for (const g of dateEntry.games) {
          if (g.postponedStatus === 'P') continue;
          games.push({
            gameId: g.gameId,
            gameDate: g.gameDateEst.slice(0, 10),
            gameTimeUtc: easternToUtc(g.gameDateTimeEst ?? ''),
            gameStatusText: g.gameStatusText ?? '',
            gameStatus: g.gameStatus,
            homeTeam: mapCDNTeam(g.homeTeam, g.gameStatus),
            awayTeam: mapCDNTeam(g.awayTeam, g.gameStatus),
          });
        }
      }

      cdnCache = games;
      cdnCachedAt = Date.now();
      logger.info(`CDN schedule cached: ${games.length} games`);
      return games;
    } catch (err) {
      logger.warn(`CDN schedule unavailable: ${err instanceof Error ? err.message : err}. Fallback to gamelog.`);
    }

    return this.buildFromGamelog();
  }

  // ── Scoreboard V2: live scores for a specific date ───────────────────────

  private async fetchScoreboard(date: string): Promise<ScheduleGame[]> {
    try {
      const response = await this.statsClient.get('/scoreboardv2', {
        GameDate: toNBADate(date),
        LeagueID: '00',
        DayOffset: 0,
      });

      const gameHeader = response.resultSets.find((rs) => rs.name === 'GameHeader');
      const lineScore  = response.resultSets.find((rs) => rs.name === 'LineScore');

      if (!gameHeader || gameHeader.rowSet.length === 0) return [];

      const lineRows = (lineScore?.rowSet ?? []).map((r) => zipRow(lineScore!.headers, r));
      const games: ScheduleGame[] = [];

      for (const rawRow of gameHeader.rowSet) {
        const row = zipRow(gameHeader.headers, rawRow);
        const gameId = String(row['GAME_ID']);
        const status = Number(row['GAME_STATUS_ID']) as 1 | 2 | 3;

        const homeId    = Number(row['HOME_TEAM_ID']);
        const visitorId = Number(row['VISITOR_TEAM_ID']);

        const homeLine  = lineRows.find((r) => Number(r['TEAM_ID']) === homeId);
        const awayLine  = lineRows.find((r) => Number(r['TEAM_ID']) === visitorId);

        const parseWL = (wl: string | number | null) => {
          const s = String(wl ?? '0-0');
          const [w, l] = s.split('-').map(Number);
          return { wins: w ?? 0, losses: l ?? 0 };
        };

        const homeWL = parseWL(homeLine?.['TEAM_WINS_LOSSES'] ?? row['HOME_TEAM_WINS']);
        const awayWL = parseWL(awayLine?.['TEAM_WINS_LOSSES'] ?? row['VISITOR_TEAM_WINS']);

        games.push({
          gameId,
          gameDate: date,
          gameTimeUtc: String(row['GAME_DATE_EST'] ?? ''),
          gameStatusText: String(row['GAME_STATUS_TEXT'] ?? ''),
          gameStatus: status,
          homeTeam: {
            id: homeId,
            city: String(homeLine?.['TEAM_CITY_NAME'] ?? ''),
            name: String(homeLine?.['TEAM_NICKNAME'] ?? homeLine?.['TEAM_NAME'] ?? ''),
            abbreviation: String(homeLine?.['TEAM_ABBREVIATION'] ?? ''),
            wins: homeWL.wins,
            losses: homeWL.losses,
            score: status > 1 ? (Number(homeLine?.['PTS']) || null) : null,
          },
          awayTeam: {
            id: visitorId,
            city: String(awayLine?.['TEAM_CITY_NAME'] ?? ''),
            name: String(awayLine?.['TEAM_NICKNAME'] ?? awayLine?.['TEAM_NAME'] ?? ''),
            abbreviation: String(awayLine?.['TEAM_ABBREVIATION'] ?? ''),
            wins: awayWL.wins,
            losses: awayWL.losses,
            score: status > 1 ? (Number(awayLine?.['PTS']) || null) : null,
          },
        });
      }

      return games;
    } catch (err) {
      logger.warn(`scoreboardv2 failed for ${date}: ${err instanceof Error ? err.message : err}`);
      return [];
    }
  }

  // ── Fallback: leaguegamelog for past dates ───────────────────────────────

  private async buildFromGamelog(): Promise<ScheduleGame[]> {
    if (cdnCache && cdnCache.length > 0) return cdnCache;
    try {
      const response = await this.statsClient.get('/leaguegamelog', {
        Season: currentSeason(),
        SeasonType: 'Regular Season',
        LeagueID: '00',
        PlayerOrTeam: 'T',
        Direction: 'ASC',
        Sorter: 'DATE',
        Counter: 0,
      });
      const rs = response.resultSets.find((s) => s.name === 'LeagueGameLog');
      if (!rs) return buildFuturePlaceholders();

      const seen = new Set<string>();
      const games: ScheduleGame[] = [];
      for (const rawRow of rs.rowSet) {
        const row = zipRow(rs.headers, rawRow);
        const gameId = String(row['GAME_ID']);
        if (seen.has(gameId)) continue;
        seen.add(gameId);
        const dateRaw = String(row['GAME_DATE'] ?? '').slice(0, 10);
        games.push({
          gameId,
          gameDate: dateRaw,
          gameTimeUtc: '',
          gameStatusText: 'Final',
          gameStatus: 3,
          homeTeam: { id: Number(row['TEAM_ID'] ?? 0), city: '', name: String(row['TEAM_NAME'] ?? ''), abbreviation: String(row['TEAM_ABBREVIATION'] ?? ''), wins: 0, losses: 0, score: null },
          awayTeam: { id: 0, city: '', name: '', abbreviation: '', wins: 0, losses: 0, score: null },
        });
      }
      const result = [...games, ...buildFuturePlaceholders()];
      cdnCache = result;
      cdnCachedAt = Date.now();
      return result;
    } catch {
      cdnCache = buildFuturePlaceholders();
      cdnCachedAt = Date.now();
      return cdnCache;
    }
  }
}

function mapCDNTeam(t: CDNTeam, status: 1 | 2 | 3) {
  return {
    id: t.teamId,
    city: t.teamCity,
    name: t.teamName,
    abbreviation: t.teamTricode,
    wins: t.wins ?? 0,
    losses: t.losses ?? 0,
    score: status > 1 ? (t.score ?? null) : null,
  };
}

// Rough placeholder: mark next 60 days as potentially having games
function buildFuturePlaceholders(): ScheduleGame[] {
  const today = new Date();
  const games: ScheduleGame[] = [];
  for (let i = 0; i <= 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    if (d.getDay() !== 1) { // NBA rarely plays Mondays
      games.push({
        gameId: `placeholder_${d.toISOString().slice(0, 10)}`,
        gameDate: d.toISOString().slice(0, 10),
        gameTimeUtc: '',
        gameStatusText: '',
        gameStatus: 1,
        homeTeam: { id: 0, city: '', name: '', abbreviation: '', wins: 0, losses: 0, score: null },
        awayTeam: { id: 0, city: '', name: '', abbreviation: '', wins: 0, losses: 0, score: null },
      });
    }
  }
  return games;
}
