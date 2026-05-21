export interface Player {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  teamId: number;
  teamName: string;
  teamAbbreviation: string;
  jerseyNumber: string;
  position: string;
  height: string;
  weight: string;
  birthdate: string;
  age: number;
  experience: string;
  school: string;
  country: string;
  draftYear: number | null;
  draftRound: number | null;
  draftNumber: number | null;
  isActive: boolean;
}

export interface PlayerRosterEntry {
  id: number;
  fullName: string;
  jerseyNumber: string;
  position: string;
  height: string;
  weight: string;
  birthdate: string;
  age: number;
  experience: string;
  school: string;
}

export interface PlayerSeasonStats {
  playerId: number;
  playerName: string;
  teamId: number;
  teamAbbreviation: string;
  season: string;
  gamesPlayed: number;
  gamesStarted: number;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fieldGoalPct: number;
  threePointPct: number;
  freeThrowPct: number;
  plusMinus: number;
}

export interface PlayerCareerRow {
  season: string;
  teamId: number;
  teamAbbreviation: string;
  leagueId: string;
  gamesPlayed: number;
  gamesStarted: number;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fieldGoalPct: number;
  threePointPct: number;
  freeThrowPct: number;
}

export interface PlayerGameEntry {
  gameId: string;
  gameDate: string;
  matchup: string;
  outcome: 'W' | 'L';
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fieldGoalPct: number;
  threePointPct: number;
  freeThrowPct: number;
  plusMinus: number;
}
