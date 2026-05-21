import { IPlayerRepository } from '../../domain/repositories/IPlayerRepository';
import { TeamSeasonStatsResponseDTO } from '../dtos/responses/PlayerResponseDTO';

export class GetTeamSeasonStatsUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(teamId: number, season: string): Promise<TeamSeasonStatsResponseDTO> {
    const players = await this.playerRepository.getSeasonStatsByTeam(teamId, season);
    return { teamId, season, players };
  }
}
