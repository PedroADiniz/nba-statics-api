import { Team } from './Team';

export interface QuarterScores {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  ot: number[];
}

export interface Game {
  id: string;
  date: string;
  season: string;
  homeTeam: Team;
  awayTeam: Team;
  homeTeamScore: number;
  awayTeamScore: number;
  homeTeamQuarters: QuarterScores | null;
  awayTeamQuarters: QuarterScores | null;
  winnerTeamId: number;
  matchup: string;
}
