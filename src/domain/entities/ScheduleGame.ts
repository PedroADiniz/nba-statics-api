export interface ScheduleTeam {
  id: number;
  city: string;
  name: string;
  abbreviation: string;
  wins: number;
  losses: number;
  score: number | null;
}

export interface ScheduleGame {
  gameId: string;
  gameDate: string;        // YYYY-MM-DD (EST date)
  gameTimeUtc: string;     // ISO UTC — empty string when TBD
  gameStatusText: string;  // "7:30 pm ET" | "Final" | "Q4 2:34" etc.
  gameStatus: 1 | 2 | 3;  // 1=scheduled 2=live 3=final
  homeTeam: ScheduleTeam;
  awayTeam: ScheduleTeam;
}

export interface GameDetailTeam extends ScheduleTeam {
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  ot1: number | null;
  ot2: number | null;
  ot3: number | null;
  ot4: number | null;
  fgPct: number | null;
  ftPct: number | null;
  fg3Pct: number | null;
  assists: number | null;
  rebounds: number | null;
}

export interface GameDetailPlayer {
  playerId: number;
  playerName: string;
  startPosition: string;
  minutes: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fgMade: number;
  fgAttempted: number;
  fg3Made: number;
  fg3Attempted: number;
  ftMade: number;
  ftAttempted: number;
  plusMinus: number;
}

export interface GameDetail {
  gameId: string;
  gameDate: string;
  gameTimeUtc: string;
  gameStatus: 1 | 2 | 3;
  gameStatusText: string;
  homeTeam: GameDetailTeam;
  awayTeam: GameDetailTeam;
  homePlayers: GameDetailPlayer[];
  awayPlayers: GameDetailPlayer[];
  attendance: number | null;
  gameDuration: string | null;
}
