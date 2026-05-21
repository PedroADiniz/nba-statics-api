import { IGameRepository } from '../../domain/repositories/IGameRepository';
import { ITeamRepository } from '../../domain/repositories/ITeamRepository';
import { TeamNotFoundError, SameTeamError, InvalidDateRangeError, NoGamesFoundError } from '../../domain/errors/DomainErrors';
import { H2HAnalysisEngine } from '../services/H2HAnalysisEngine';
import { GetH2HRequestDTO } from '../dtos/requests/GetH2HRequestDTO';
import { H2HAnalysisResponseDTO, toH2HAnalysisResponseDTO } from '../dtos/responses/H2HAnalysisResponseDTO';
import { PrismaH2HCacheRepository } from '../../infrastructure/repositories/PrismaH2HCacheRepository';
import { logger } from '../../shared/logger/logger';

export class GetH2HAnalysisUseCase {
  private readonly engine = new H2HAnalysisEngine();
  private readonly cache = new PrismaH2HCacheRepository();

  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly teamRepository: ITeamRepository,
  ) {}

  async execute(dto: GetH2HRequestDTO): Promise<H2HAnalysisResponseDTO> {
    if (dto.team1Id === dto.team2Id) throw new SameTeamError();
    if (new Date(dto.startDate) > new Date(dto.endDate)) throw new InvalidDateRangeError();

    const [team1, team2] = await Promise.all([
      this.teamRepository.findById(dto.team1Id),
      this.teamRepository.findById(dto.team2Id),
    ]);

    if (!team1) throw new TeamNotFoundError(dto.team1Id);
    if (!team2) throw new TeamNotFoundError(dto.team2Id);

    const cached = await this.cache.get<H2HAnalysisResponseDTO>(
      dto.team1Id, dto.team2Id, dto.startDate, dto.endDate,
    );
    if (cached) {
      logger.info(`H2H (cache): ${team1.abbreviation} vs ${team2.abbreviation}`);
      return cached;
    }

    logger.info(`H2H (live): ${team1.fullName} vs ${team2.fullName} | ${dto.startDate} → ${dto.endDate}`);

    const games = await this.gameRepository.findH2H({
      team1Id: dto.team1Id,
      team2Id: dto.team2Id,
      startDate: dto.startDate,
      endDate: dto.endDate,
      includeQuarters: dto.includeQuarters ?? false,
    });

    if (games.length === 0) throw new NoGamesFoundError(team1.fullName, team2.fullName);

    logger.info(`H2H: ${games.length} jogo(s) encontrado(s)`);

    const analysis = this.engine.analyze(games, team1, team2, dto.startDate, dto.endDate);
    const response = toH2HAnalysisResponseDTO(analysis);

    await this.cache.set(dto.team1Id, dto.team2Id, dto.startDate, dto.endDate, response);

    return response;
  }
}
