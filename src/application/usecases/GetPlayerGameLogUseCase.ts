import { IPlayerRepository } from '../../domain/repositories/IPlayerRepository';
import { GameLogResponseDTO } from '../dtos/responses/PlayerResponseDTO';

export class GetPlayerGameLogUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(playerId: number, season: string): Promise<GameLogResponseDTO> {
    const games = await this.playerRepository.getGameLog(playerId, season);
    return { playerId, season, games };
  }
}
