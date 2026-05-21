import { Game } from '../entities/Game';

export interface FindH2HParams {
  team1Id: number;
  team2Id: number;
  startDate: string;
  endDate: string;
  includeQuarters?: boolean;
}

export interface IGameRepository {
  findH2H(params: FindH2HParams): Promise<Game[]>;
  findQuarterScores(gameId: string): Promise<{ homeQuarters: import('../entities/Game').QuarterScores; awayQuarters: import('../entities/Game').QuarterScores } | null>;
}
