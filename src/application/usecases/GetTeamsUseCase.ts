import { ITeamRepository } from '../../domain/repositories/ITeamRepository';
import { TeamResponseDTO, toTeamResponseDTO } from '../dtos/responses/TeamResponseDTO';

export interface GetTeamsFilters {
  conference?: 'East' | 'West';
}

export class GetTeamsUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(filters: GetTeamsFilters = {}): Promise<TeamResponseDTO[]> {
    const teams = filters.conference
      ? await this.teamRepository.findByConference(filters.conference)
      : await this.teamRepository.findAll();

    return teams.map(toTeamResponseDTO);
  }
}
