import { H2HAnalysis } from '../../../domain/entities/H2HAnalysis';
import { TeamResponseDTO, toTeamResponseDTO } from './TeamResponseDTO';
import { GameResponseDTO, toGameResponseDTO } from './GameResponseDTO';

export interface OverUnderLineDTO {
  line: number;
  over: number;
  under: number;
  overPct: number;
  underPct: number;
}

export interface ScoringThresholdDTO {
  points: number;
  count: number;
  pct: number;
}

export interface QuarterAverageDTO {
  quarter: string;
  avg: number;
  combinedAvg: number;
}

export interface HalftimeCrossoverDTO {
  halftimeLeader: string;
  finalWinner: string;
  count: number;
  pct: number;
  isComeback: boolean;
}

export interface H2HAnalysisResponseDTO {
  meta: {
    team1: TeamResponseDTO;
    team2: TeamResponseDTO;
    startDate: string;
    endDate: string;
    totalGames: number;
    generatedAt: string;
  };
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
    crossovers: HalftimeCrossoverDTO[];
  };
  quarterAverages: {
    gamesWithData: number;
    team1: QuarterAverageDTO[];
    team2: QuarterAverageDTO[];
  };
  scoring: {
    team1Avg: number;
    team2Avg: number;
    totalAvg: number;
    marginAvg: number;
    biggestWin: GameResponseDTO | null;
    lastGame: GameResponseDTO | null;
    closeGames: number;
    blowouts: number;
  };
  thresholds: {
    team1: ScoringThresholdDTO[];
    team2: ScoringThresholdDTO[];
    total: OverUnderLineDTO[];
  };
  games: GameResponseDTO[];
}

export function toH2HAnalysisResponseDTO(analysis: H2HAnalysis): H2HAnalysisResponseDTO {
  return {
    meta: {
      team1: toTeamResponseDTO(analysis.team1),
      team2: toTeamResponseDTO(analysis.team2),
      startDate: analysis.startDate,
      endDate: analysis.endDate,
      totalGames: analysis.totalGames,
      generatedAt: new Date().toISOString(),
    },
    record: analysis.record,
    halftime: {
      ...analysis.halftime,
      crossovers: analysis.halftime.crossovers.map((c) => ({
        halftimeLeader: c.halftimeLeader,
        finalWinner: c.finalWinner,
        count: c.count,
        pct: c.pct,
        isComeback: c.isComeback,
      })),
    },
    quarterAverages: analysis.quarterAverages,
    scoring: {
      ...analysis.scoring,
      biggestWin: analysis.scoring.biggestWin ? toGameResponseDTO(analysis.scoring.biggestWin) : null,
      lastGame: analysis.scoring.lastGame ? toGameResponseDTO(analysis.scoring.lastGame) : null,
    },
    thresholds: analysis.thresholds,
    games: analysis.games.map(toGameResponseDTO),
  };
}
