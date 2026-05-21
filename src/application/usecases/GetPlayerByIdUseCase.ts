import { IPlayerRepository } from '../../domain/repositories/IPlayerRepository';
import { PlayerProfileDTO } from '../dtos/responses/PlayerResponseDTO';

export class GetPlayerByIdUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(playerId: number): Promise<PlayerProfileDTO> {
    return this.playerRepository.getPlayerById(playerId);
  }
}
