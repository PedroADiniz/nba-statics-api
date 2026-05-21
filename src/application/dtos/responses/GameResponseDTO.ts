import { GameResult } from '../../../domain/entities/H2HAnalysis';

export interface QuarterScoreDTO {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

export interface GameResponseDTO {
  gameId: string;
  date: string;
  season: string;
  team1IsHome: boolean;
  team1Score: number;
  team2Score: number;
  team1HalftimeScore: number | null;
  team2HalftimeScore: number | null;
  team1Quarters: QuarterScoreDTO | null;
  team2Quarters: QuarterScoreDTO | null;
  winner: 'team1' | 'team2';
  margin: number;
  total: number;
}

export function toGameResponseDTO(result: GameResult): GameResponseDTO {
  return {
    gameId: result.gameId,
    date: result.date,
    season: result.season,
    team1IsHome: result.team1IsHome,
    team1Score: result.team1Score,
    team2Score: result.team2Score,
    team1HalftimeScore: result.team1HalftimeScore,
    team2HalftimeScore: result.team2HalftimeScore,
    team1Quarters: result.team1Quarters
      ? { q1: result.team1Quarters[0], q2: result.team1Quarters[1], q3: result.team1Quarters[2], q4: result.team1Quarters[3] }
      : null,
    team2Quarters: result.team2Quarters
      ? { q1: result.team2Quarters[0], q2: result.team2Quarters[1], q3: result.team2Quarters[2], q4: result.team2Quarters[3] }
      : null,
    winner: result.winner,
    margin: result.margin,
    total: result.total,
  };
}
