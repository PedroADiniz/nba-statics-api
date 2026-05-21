import { Team } from '../../../domain/entities/Team';

export interface TeamResponseDTO {
  id: number;
  abbreviation: string;
  city: string;
  name: string;
  fullName: string;
  conference: string;
  division: string;
}

export function toTeamResponseDTO(team: Team): TeamResponseDTO {
  return {
    id: team.id,
    abbreviation: team.abbreviation,
    city: team.city,
    name: team.name,
    fullName: team.fullName,
    conference: team.conference,
    division: team.division,
  };
}
