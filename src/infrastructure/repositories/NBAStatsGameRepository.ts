import { Game, QuarterScores } from '../../domain/entities/Game';
import { IGameRepository, FindH2HParams } from '../../domain/repositories/IGameRepository';
import { NBAStatsHttpClient, zipRow } from '../http/NBAStatsHttpClient';
import { StaticTeamRepository } from './StaticTeamRepository';
import { logger } from '../../shared/logger/logger';

const teamRepo = new StaticTeamRepository();

function toNBADate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

export class NBAStatsGameRepository implements IGameRepository {
  constructor(private readonly client: NBAStatsHttpClient) {}

  async findH2H(params: FindH2HParams): Promise<Game[]> {
    const response = await this.client.get('/leaguegamefinder', {
      PlayerOrTeam: 'T',
      LeagueID: '00',
      TeamID: params.team1Id,
      VsTeamID: params.team2Id,
      DateFrom: toNBADate(params.startDate),
      DateTo: toNBADate(params.endDate),
    });

    const resultSet = response.resultSets.find((rs) => rs.name === 'LeagueGameFinderResults');
    if (!resultSet || resultSet.rowSet.length === 0) return [];

    const rows = resultSet.rowSet.map((row) => zipRow(resultSet.headers, row));

    const seenIds = new Set<string>();
    const team1 = await teamRepo.findById(params.team1Id);
    const team2 = await teamRepo.findById(params.team2Id);

    if (!team1 || !team2) return [];

    const games: Game[] = [];

    for (const row of rows) {
      const gameId = String(row['GAME_ID']);
      if (seenIds.has(gameId)) continue;
      seenIds.add(gameId);

      const matchup = String(row['MATCHUP'] ?? '');
      const isHome = matchup.includes('vs.');
      const homeTeam = isHome ? team1 : team2;
      const awayTeam = isHome ? team2 : team1;

      const pts = Number(row['PTS'] ?? 0);
      const plusMinus = Number(row['PLUS_MINUS'] ?? 0);
      const homeScore = isHome ? pts : pts - plusMinus;
      const awayScore = isHome ? pts - plusMinus : pts;

      let homeQuarters: QuarterScores | null = null;
      let awayQuarters: QuarterScores | null = null;

      if (params.includeQuarters) {
        const qs = await this.findQuarterScores(gameId);
        if (qs) {
          homeQuarters = qs.homeQuarters;
          awayQuarters = qs.awayQuarters;
        }
      }

      games.push({
        id: gameId,
        date: String(row['GAME_DATE'] ?? ''),
        season: String(row['SEASON_ID'] ?? ''),
        homeTeam,
        awayTeam,
        homeTeamScore: homeScore,
        awayTeamScore: awayScore,
        homeTeamQuarters: homeQuarters,
        awayTeamQuarters: awayQuarters,
        winnerTeamId: homeScore > awayScore ? homeTeam.id : awayTeam.id,
        matchup,
      });
    }

    return games.sort((a, b) => a.date.localeCompare(b.date));
  }

  async findQuarterScores(gameId: string): Promise<{ homeQuarters: QuarterScores; awayQuarters: QuarterScores } | null> {
    try {
      const response = await this.client.get('/boxscoresummaryv2', { GameID: gameId });
      const lineScore = response.resultSets.find((rs) => rs.name === 'LineScore');
      if (!lineScore || lineScore.rowSet.length < 2) return null;

      const parse = (row: ReturnType<typeof zipRow>): QuarterScores => ({
        q1: Number(row['PTS_QTR1'] ?? 0),
        q2: Number(row['PTS_QTR2'] ?? 0),
        q3: Number(row['PTS_QTR3'] ?? 0),
        q4: Number(row['PTS_QTR4'] ?? 0),
        ot: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          .map((n) => Number(row[`PTS_OT${n}`] ?? 0))
          .filter((v) => v > 0),
      });

      const homeRow = zipRow(lineScore.headers, lineScore.rowSet[0]);
      const awayRow = zipRow(lineScore.headers, lineScore.rowSet[1]);

      return {
        homeQuarters: parse(homeRow),
        awayQuarters: parse(awayRow),
      };
    } catch (err) {
      logger.warn(`Não foi possível obter quartos do jogo ${gameId}: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  }
}
