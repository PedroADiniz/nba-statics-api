import { Game } from '../../domain/entities/Game';
import { Team } from '../../domain/entities/Team';
import {
  GameResult,
  H2HAnalysis,
  HalftimeCrossover,
  OverUnderLine,
  QuarterAverage,
  ScoringThreshold,
} from '../../domain/entities/H2HAnalysis';

const OVER_UNDER_LINES = [195.5, 200.5, 205.5, 210.5, 215.5, 220.5, 225.5, 230.5, 235.5, 240.5];
const TEAM_SCORING_THRESHOLDS = [90, 95, 100, 105, 110, 115, 120, 125, 130];

export class H2HAnalysisEngine {
  analyze(games: Game[], team1: Team, team2: Team, startDate: string, endDate: string): H2HAnalysis {
    const sorted = [...games].sort((a, b) => a.date.localeCompare(b.date));
    const results = sorted.map((g) => this.toGameResult(g, team1.id));

    return {
      team1,
      team2,
      startDate,
      endDate,
      totalGames: results.length,
      record: this.computeRecord(results),
      halftime: this.computeHalftime(results),
      quarterAverages: this.computeQuarterAverages(results),
      scoring: this.computeScoring(results),
      thresholds: this.computeThresholds(results),
      games: results,
      rawGames: sorted,
    };
  }

  private toGameResult(game: Game, team1Id: number): GameResult {
    const team1IsHome = game.homeTeam.id === team1Id;
    const team1Score = team1IsHome ? game.homeTeamScore : game.awayTeamScore;
    const team2Score = team1IsHome ? game.awayTeamScore : game.homeTeamScore;

    const team1Q = team1IsHome ? game.homeTeamQuarters : game.awayTeamQuarters;
    const team2Q = team1IsHome ? game.awayTeamQuarters : game.homeTeamQuarters;

    const team1Halftime = team1Q ? team1Q.q1 + team1Q.q2 : null;
    const team2Halftime = team2Q ? team2Q.q1 + team2Q.q2 : null;

    return {
      gameId: game.id,
      date: game.date,
      season: game.season,
      team1IsHome,
      team1Score,
      team2Score,
      team1HalftimeScore: team1Halftime,
      team2HalftimeScore: team2Halftime,
      team1Quarters: team1Q ? [team1Q.q1, team1Q.q2, team1Q.q3, team1Q.q4] : null,
      team2Quarters: team2Q ? [team2Q.q1, team2Q.q2, team2Q.q3, team2Q.q4] : null,
      winner: team1Score > team2Score ? 'team1' : 'team2',
      margin: Math.abs(team1Score - team2Score),
      total: team1Score + team2Score,
    };
  }

  private computeRecord(results: GameResult[]) {
    const total = results.length;
    const team1Wins = results.filter((r) => r.winner === 'team1').length;
    const team2Wins = results.filter((r) => r.winner === 'team2').length;
    return {
      team1Wins,
      team2Wins,
      team1WinPct: total > 0 ? round((team1Wins / total) * 100) : 0,
      team2WinPct: total > 0 ? round((team2Wins / total) * 100) : 0,
    };
  }

  private computeHalftime(results: GameResult[]) {
    const withData = results.filter(
      (r) => r.team1HalftimeScore !== null && r.team2HalftimeScore !== null,
    );
    const n = withData.length;

    const team1Leads = withData.filter((r) => r.team1HalftimeScore! > r.team2HalftimeScore!).length;
    const team2Leads = withData.filter((r) => r.team2HalftimeScore! > r.team1HalftimeScore!).length;
    const tied = withData.filter((r) => r.team1HalftimeScore === r.team2HalftimeScore).length;

    const crossovers = this.computeCrossovers(withData, n);

    return {
      gamesWithData: n,
      team1Leads,
      team2Leads,
      tied,
      team1LeadPct: n > 0 ? round((team1Leads / n) * 100) : 0,
      team2LeadPct: n > 0 ? round((team2Leads / n) * 100) : 0,
      crossovers,
    };
  }

  private computeCrossovers(results: GameResult[], total: number): HalftimeCrossover[] {
    type HTLeader = 'team1' | 'team2' | 'tied';
    type FinalWinner = 'team1' | 'team2';

    const combos: Record<string, { halftimeLeader: HTLeader; finalWinner: FinalWinner; count: number }> =
      {
        't1_t1': { halftimeLeader: 'team1', finalWinner: 'team1', count: 0 },
        't1_t2': { halftimeLeader: 'team1', finalWinner: 'team2', count: 0 },
        't2_t1': { halftimeLeader: 'team2', finalWinner: 'team1', count: 0 },
        't2_t2': { halftimeLeader: 'team2', finalWinner: 'team2', count: 0 },
        'tied_t1': { halftimeLeader: 'tied', finalWinner: 'team1', count: 0 },
        'tied_t2': { halftimeLeader: 'tied', finalWinner: 'team2', count: 0 },
      };

    for (const r of results) {
      const ht: HTLeader =
        r.team1HalftimeScore! > r.team2HalftimeScore!
          ? 'team1'
          : r.team2HalftimeScore! > r.team1HalftimeScore!
            ? 'team2'
            : 'tied';
      const fw: FinalWinner = r.winner;
      const key = `${ht === 'tied' ? 'tied' : ht === 'team1' ? 't1' : 't2'}_${fw === 'team1' ? 't1' : 't2'}`;
      if (combos[key]) combos[key].count++;
    }

    return Object.values(combos)
      .filter((c) => c.count > 0)
      .map((c) => ({
        halftimeLeader: c.halftimeLeader,
        finalWinner: c.finalWinner,
        count: c.count,
        pct: total > 0 ? round((c.count / total) * 100) : 0,
        isComeback:
          c.halftimeLeader !== 'tied' &&
          c.halftimeLeader !== c.finalWinner,
      }));
  }

  private computeQuarterAverages(results: GameResult[]) {
    const withData = results.filter((r) => r.team1Quarters !== null && r.team2Quarters !== null);
    const n = withData.length;

    const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
    const team1Avgs: QuarterAverage[] = labels.map((q, i) => {
      const t1Sum = withData.reduce((s, r) => s + r.team1Quarters![i], 0);
      const t2Sum = withData.reduce((s, r) => s + r.team2Quarters![i], 0);
      return {
        quarter: q,
        avg: n > 0 ? round(t1Sum / n) : 0,
        combinedAvg: n > 0 ? round((t1Sum + t2Sum) / n) : 0,
      };
    });

    const team2Avgs: QuarterAverage[] = labels.map((q, i) => {
      const t2Sum = withData.reduce((s, r) => s + r.team2Quarters![i], 0);
      const t1Sum = withData.reduce((s, r) => s + r.team1Quarters![i], 0);
      return {
        quarter: q,
        avg: n > 0 ? round(t2Sum / n) : 0,
        combinedAvg: n > 0 ? round((t1Sum + t2Sum) / n) : 0,
      };
    });

    return { gamesWithData: n, team1: team1Avgs, team2: team2Avgs };
  }

  private computeScoring(results: GameResult[]) {
    const n = results.length;
    if (n === 0) {
      return {
        team1Avg: 0,
        team2Avg: 0,
        totalAvg: 0,
        marginAvg: 0,
        biggestWin: null,
        lastGame: null,
        closeGames: 0,
        blowouts: 0,
      };
    }

    const team1Avg = round(results.reduce((s, r) => s + r.team1Score, 0) / n);
    const team2Avg = round(results.reduce((s, r) => s + r.team2Score, 0) / n);
    const totalAvg = round(results.reduce((s, r) => s + r.total, 0) / n);
    const marginAvg = round(results.reduce((s, r) => s + r.margin, 0) / n);
    const biggestWin = results.reduce((prev, cur) => (cur.margin > prev.margin ? cur : prev));
    const lastGame = results[results.length - 1];
    const closeGames = results.filter((r) => r.margin <= 5).length;
    const blowouts = results.filter((r) => r.margin >= 20).length;

    return { team1Avg, team2Avg, totalAvg, marginAvg, biggestWin, lastGame, closeGames, blowouts };
  }

  private computeThresholds(results: GameResult[]) {
    const n = results.length;

    const team1: ScoringThreshold[] = TEAM_SCORING_THRESHOLDS.map((pts) => {
      const count = results.filter((r) => r.team1Score >= pts).length;
      return { points: pts, count, pct: n > 0 ? round((count / n) * 100) : 0 };
    });

    const team2: ScoringThreshold[] = TEAM_SCORING_THRESHOLDS.map((pts) => {
      const count = results.filter((r) => r.team2Score >= pts).length;
      return { points: pts, count, pct: n > 0 ? round((count / n) * 100) : 0 };
    });

    const total: OverUnderLine[] = OVER_UNDER_LINES.map((line) => {
      const over = results.filter((r) => r.total > line).length;
      const under = results.filter((r) => r.total < line).length;
      return {
        line,
        over,
        under,
        overPct: n > 0 ? round((over / n) * 100) : 0,
        underPct: n > 0 ? round((under / n) * 100) : 0,
      };
    });

    return { team1, team2, total };
  }
}

function round(value: number, decimals = 1): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}
