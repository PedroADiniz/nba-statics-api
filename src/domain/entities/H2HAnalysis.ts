import { Team } from './Team';
import { Game } from './Game';

export interface GameResult {
  gameId: string;
  date: string;
  season: string;
  team1IsHome: boolean;
  team1Score: number;
  team2Score: number;
  team1HalftimeScore: number | null;
  team2HalftimeScore: number | null;
  team1Quarters: [number, number, number, number] | null;
  team2Quarters: [number, number, number, number] | null;
  winner: 'team1' | 'team2';
  margin: number;
  total: number;
}

export interface OverUnderLine {
  line: number;
  over: number;
  under: number;
  overPct: number;
  underPct: number;
}

export interface ScoringThreshold {
  points: number;
  count: number;
  pct: number;
}

export interface QuarterAverage {
  quarter: string;
  avg: number;
  combinedAvg: number;
}

export interface HalftimeCrossover {
  halftimeLeader: 'team1' | 'team2' | 'tied';
  finalWinner: 'team1' | 'team2';
  count: number;
  pct: number;
  isComeback: boolean;
}

export interface H2HAnalysis {
  team1: Team;
  team2: Team;
  startDate: string;
  endDate: string;
  totalGames: number;

  record: {
    team1Wins: number;
    team2Wins: number;
    team1WinPct: number;
    team2WinPct: number;
  };

  halftime: {
    gamesWithData: number;
    team1Leads: number;
    team2Leads: number;
    tied: number;
    team1LeadPct: number;
    team2LeadPct: number;
    crossovers: HalftimeCrossover[];
  };

  quarterAverages: {
    gamesWithData: number;
    team1: QuarterAverage[];
    team2: QuarterAverage[];
  };

  scoring: {
    team1Avg: number;
    team2Avg: number;
    totalAvg: number;
    marginAvg: number;
    biggestWin: GameResult | null;
    lastGame: GameResult | null;
    closeGames: number;
    blowouts: number;
  };

  thresholds: {
    team1: ScoringThreshold[];
    team2: ScoringThreshold[];
    total: OverUnderLine[];
  };

  games: GameResult[];
  rawGames: Game[];
}
