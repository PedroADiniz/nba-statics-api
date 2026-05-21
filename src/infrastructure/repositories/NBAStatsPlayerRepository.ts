import { IPlayerRepository } from '../../domain/repositories/IPlayerRepository';
import {
  Player,
  PlayerRosterEntry,
  PlayerCareerRow,
  PlayerGameEntry,
  PlayerSeasonStats,
} from '../../domain/entities/Player';
import { NBAStatsHttpClient, zipRow } from '../http/NBAStatsHttpClient';
import { NotFoundError } from '../../shared/errors/AppError';
import { logger } from '../../shared/logger/logger';

export class NBAStatsPlayerRepository implements IPlayerRepository {
  constructor(private readonly client: NBAStatsHttpClient) {}

  async getRosterByTeam(teamId: number, season: string): Promise<PlayerRosterEntry[]> {
    logger.debug(`getRosterByTeam teamId=${teamId} season=${season}`);
    const response = await this.client.get('/commonteamroster', {
      TeamID: teamId,
      Season: season,
      LeagueID: '00',
    });

    const rs = response.resultSets.find((s) => s.name === 'CommonTeamRoster');
    if (!rs) return [];

    return rs.rowSet.map((row) => {
      const r = zipRow(rs.headers, row);
      return {
        id: Number(r['PLAYER_ID']),
        fullName: String(r['PLAYER'] ?? ''),
        jerseyNumber: String(r['NUM'] ?? ''),
        position: String(r['POSITION'] ?? ''),
        height: String(r['HEIGHT'] ?? ''),
        weight: String(r['WEIGHT'] ?? ''),
        birthdate: String(r['BIRTH_DATE'] ?? ''),
        age: Number(r['AGE'] ?? 0),
        experience: String(r['EXP'] ?? ''),
        school: String(r['SCHOOL'] ?? ''),
      };
    });
  }

  async getPlayerById(playerId: number): Promise<Player> {
    logger.debug(`getPlayerById playerId=${playerId}`);
    const response = await this.client.get('/commonplayerinfo', {
      PlayerID: playerId,
    });

    const rs = response.resultSets.find((s) => s.name === 'CommonPlayerInfo');
    if (!rs || rs.rowSet.length === 0) {
      throw new NotFoundError(`Jogador ${playerId}`);
    }

    const r = zipRow(rs.headers, rs.rowSet[0]);
    return {
      id: Number(r['PERSON_ID']),
      fullName: String(r['DISPLAY_FIRST_LAST'] ?? ''),
      firstName: String(r['FIRST_NAME'] ?? ''),
      lastName: String(r['LAST_NAME'] ?? ''),
      teamId: Number(r['TEAM_ID'] ?? 0),
      teamName: String(r['TEAM_NAME'] ?? ''),
      teamAbbreviation: String(r['TEAM_ABBREVIATION'] ?? ''),
      jerseyNumber: String(r['JERSEY'] ?? ''),
      position: String(r['POSITION'] ?? ''),
      height: String(r['HEIGHT'] ?? ''),
      weight: String(r['WEIGHT'] ?? ''),
      birthdate: String(r['BIRTHDATE'] ?? ''),
      age: Number(r['SEASON_EXP'] ?? 0),
      experience: String(r['SEASON_EXP'] ?? ''),
      school: String(r['SCHOOL'] ?? ''),
      country: String(r['COUNTRY'] ?? ''),
      draftYear: r['DRAFT_YEAR'] ? Number(r['DRAFT_YEAR']) : null,
      draftRound: r['DRAFT_ROUND'] ? Number(r['DRAFT_ROUND']) : null,
      draftNumber: r['DRAFT_NUMBER'] ? Number(r['DRAFT_NUMBER']) : null,
      isActive: String(r['ROSTERSTATUS'] ?? '') === 'Active',
    };
  }

  async getCareerStats(playerId: number): Promise<PlayerCareerRow[]> {
    logger.debug(`getCareerStats playerId=${playerId}`);
    const response = await this.client.get('/playercareerstats', {
      PlayerID: playerId,
      PerMode: 'PerGame',
      LeagueID: '00',
    });

    const rs = response.resultSets.find((s) => s.name === 'SeasonTotalsRegularSeason');
    if (!rs) return [];

    return rs.rowSet.map((row) => {
      const r = zipRow(rs.headers, row);
      return {
        season: String(r['SEASON_ID'] ?? ''),
        teamId: Number(r['TEAM_ID'] ?? 0),
        teamAbbreviation: String(r['TEAM_ABBREVIATION'] ?? ''),
        leagueId: String(r['LEAGUE_ID'] ?? ''),
        gamesPlayed: Number(r['GP'] ?? 0),
        gamesStarted: Number(r['GS'] ?? 0),
        minutes: Number(r['MIN'] ?? 0),
        points: Number(r['PTS'] ?? 0),
        rebounds: Number(r['REB'] ?? 0),
        assists: Number(r['AST'] ?? 0),
        steals: Number(r['STL'] ?? 0),
        blocks: Number(r['BLK'] ?? 0),
        turnovers: Number(r['TOV'] ?? 0),
        fieldGoalPct: Number(r['FG_PCT'] ?? 0),
        threePointPct: Number(r['FG3_PCT'] ?? 0),
        freeThrowPct: Number(r['FT_PCT'] ?? 0),
      };
    });
  }

  async getGameLog(playerId: number, season: string): Promise<PlayerGameEntry[]> {
    logger.debug(`getGameLog playerId=${playerId} season=${season}`);
    const response = await this.client.get('/playergamelog', {
      PlayerID: playerId,
      Season: season,
      SeasonType: 'Regular Season',
      LeagueID: '00',
    });

    const rs = response.resultSets.find((s) => s.name === 'PlayerGameLog');
    if (!rs) return [];

    return rs.rowSet.map((row) => {
      const r = zipRow(rs.headers, row);
      return {
        gameId: String(r['Game_ID'] ?? ''),
        gameDate: String(r['GAME_DATE'] ?? ''),
        matchup: String(r['MATCHUP'] ?? ''),
        outcome: String(r['WL'] ?? '') === 'W' ? 'W' : 'L',
        minutes: Number(r['MIN'] ?? 0),
        points: Number(r['PTS'] ?? 0),
        rebounds: Number(r['REB'] ?? 0),
        assists: Number(r['AST'] ?? 0),
        steals: Number(r['STL'] ?? 0),
        blocks: Number(r['BLK'] ?? 0),
        turnovers: Number(r['TOV'] ?? 0),
        fieldGoalPct: Number(r['FG_PCT'] ?? 0),
        threePointPct: Number(r['FG3_PCT'] ?? 0),
        freeThrowPct: Number(r['FT_PCT'] ?? 0),
        plusMinus: Number(r['PLUS_MINUS'] ?? 0),
      };
    });
  }

  async getSeasonStatsByTeam(teamId: number, season: string): Promise<PlayerSeasonStats[]> {
    logger.debug(`getSeasonStatsByTeam teamId=${teamId} season=${season}`);
    const response = await this.client.get('/leaguedashplayerstats', {
      Season: season,
      PerMode: 'PerGame',
      TeamID: teamId,
      LeagueID: '00',
      MeasureType: 'Base',
      PaceAdjust: 'N',
      PlusMinus: 'N',
      Rank: 'N',
      SeasonType: 'Regular Season',
      Outcome: '',
      Location: '',
      Month: 0,
      SeasonSegment: '',
      DateFrom: '',
      DateTo: '',
      OpponentTeamID: 0,
      VsConference: '',
      VsDivision: '',
      GameSegment: '',
      Period: 0,
      ShotClockRange: '',
      LastNGames: 0,
      GameScope: '',
      PlayerExperience: '',
      PlayerPosition: '',
      StarterBench: '',
      DraftYear: '',
      DraftPick: '',
      College: '',
      Country: '',
      Height: '',
      Weight: '',
      TwoWay: '',
    });

    const rs = response.resultSets.find((s) => s.name === 'LeagueDashPlayerStats');
    if (!rs) return [];

    return rs.rowSet.map((row) => {
      const r = zipRow(rs.headers, row);
      return {
        playerId: Number(r['PLAYER_ID']),
        playerName: String(r['PLAYER_NAME'] ?? ''),
        teamId: Number(r['TEAM_ID'] ?? 0),
        teamAbbreviation: String(r['TEAM_ABBREVIATION'] ?? ''),
        season,
        gamesPlayed: Number(r['GP'] ?? 0),
        gamesStarted: Number(r['GS'] ?? 0),
        minutes: Number(r['MIN'] ?? 0),
        points: Number(r['PTS'] ?? 0),
        rebounds: Number(r['REB'] ?? 0),
        assists: Number(r['AST'] ?? 0),
        steals: Number(r['STL'] ?? 0),
        blocks: Number(r['BLK'] ?? 0),
        turnovers: Number(r['TOV'] ?? 0),
        fieldGoalPct: Number(r['FG_PCT'] ?? 0),
        threePointPct: Number(r['FG3_PCT'] ?? 0),
        freeThrowPct: Number(r['FT_PCT'] ?? 0),
        plusMinus: Number(r['PLUS_MINUS'] ?? 0),
      };
    });
  }
}
