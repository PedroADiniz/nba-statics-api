import {
  Player,
  PlayerRosterEntry,
  PlayerCareerRow,
  PlayerGameEntry,
  PlayerSeasonStats,
} from '../entities/Player';

export interface IPlayerRepository {
  getRosterByTeam(teamId: number, season: string): Promise<PlayerRosterEntry[]>;
  getPlayerById(playerId: number): Promise<Player>;
  getCareerStats(playerId: number): Promise<PlayerCareerRow[]>;
  getGameLog(playerId: number, season: string): Promise<PlayerGameEntry[]>;
  getSeasonStatsByTeam(teamId: number, season: string): Promise<PlayerSeasonStats[]>;
}
