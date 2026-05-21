export interface PlayerRosterEntryDTO {
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

export interface RosterResponseDTO {
  teamId: number;
  season: string;
  players: PlayerRosterEntryDTO[];
}

export interface PlayerProfileDTO {
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

export interface PlayerCareerRowDTO {
  season: string;
  teamId: number;
  teamAbbreviation: string;
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

export interface CareerStatsResponseDTO {
  playerId: number;
  seasons: PlayerCareerRowDTO[];
}

export interface PlayerGameEntryDTO {
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

export interface GameLogResponseDTO {
  playerId: number;
  season: string;
  games: PlayerGameEntryDTO[];
}

export interface PlayerSeasonStatsDTO {
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

export interface TeamSeasonStatsResponseDTO {
  teamId: number;
  season: string;
  players: PlayerSeasonStatsDTO[];
}
