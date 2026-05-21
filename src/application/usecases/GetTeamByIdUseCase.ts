import { ITeamRepository } from '../../domain/repositories/ITeamRepository';
import { TeamResponseDTO, toTeamResponseDTO } from '../dtos/responses/TeamResponseDTO';
import { TeamNotFoundError } from '../../domain/errors/DomainErrors';

export class GetTeamByIdUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(id: number): Promise<TeamResponseDTO> {
    const team = await this.teamRepository.findById(id);
    if (!team) throw new TeamNotFoundError(id);
    return toTeamResponseDTO(team);
  }
}
