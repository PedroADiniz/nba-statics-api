import { IPlayerRepository } from '../../domain/repositories/IPlayerRepository';
import { CareerStatsResponseDTO } from '../dtos/responses/PlayerResponseDTO';

export class GetPlayerCareerUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(playerId: number): Promise<CareerStatsResponseDTO> {
    const seasons = await this.playerRepository.getCareerStats(playerId);
    return { playerId, seasons };
  }
}
