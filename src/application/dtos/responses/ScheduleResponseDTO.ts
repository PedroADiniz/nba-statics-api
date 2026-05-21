export interface ScheduleTeamDTO {
  id: number;
  city: string;
  name: string;
  abbreviation: string;
  wins: number;
  losses: number;
  score: number | null;
}

export interface ScheduleGameDTO {
  gameId: string;
  gameDate: string;
  gameTimeUtc: string;
  gameStatusText: string;
  gameStatus: 1 | 2 | 3;
  homeTeam: ScheduleTeamDTO;
  awayTeam: ScheduleTeamDTO;
}

export interface ScheduleByDateResponseDTO {
  date: string;
  games: ScheduleGameDTO[];
}

export interface ScheduleDatesResponseDTO {
  dates: string[];  
}
