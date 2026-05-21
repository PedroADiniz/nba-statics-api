import { IPlayerRepository } from '../../domain/repositories/IPlayerRepository';
import { RosterResponseDTO } from '../dtos/responses/PlayerResponseDTO';

export class GetRosterByTeamUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(teamId: number, season: string): Promise<RosterResponseDTO> {
    const players = await this.playerRepository.getRosterByTeam(teamId, season);
    return { teamId, season, players };
  }
}
