import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GetRosterByTeamUseCase } from '../../application/usecases/GetRosterByTeamUseCase';
import { GetPlayerByIdUseCase } from '../../application/usecases/GetPlayerByIdUseCase';
import { GetPlayerCareerUseCase } from '../../application/usecases/GetPlayerCareerUseCase';
import { GetPlayerGameLogUseCase } from '../../application/usecases/GetPlayerGameLogUseCase';
import { GetTeamSeasonStatsUseCase } from '../../application/usecases/GetTeamSeasonStatsUseCase';
import { RosterQuery, PlayerIdParam, GameLogQuery, TeamStatsQuery } from '../validators/players.validator';

export class PlayersController {
  constructor(
    private readonly getRoster: GetRosterByTeamUseCase,
    private readonly getPlayer: GetPlayerByIdUseCase,
    private readonly getCareer: GetPlayerCareerUseCase,
    private readonly getGameLog: GetPlayerGameLogUseCase,
    private readonly getTeamStats: GetTeamSeasonStatsUseCase,
  ) {}

  roster = async (req: Request, res: Response): Promise<void> => {
    const { teamId, season } = req.query as unknown as RosterQuery;
    const result = await this.getRoster.execute(teamId, season);
    res.status(StatusCodes.OK).json({ status: 'success', data: result });
  };

  profile = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as PlayerIdParam;
    const result = await this.getPlayer.execute(id);
    res.status(StatusCodes.OK).json({ status: 'success', data: result });
  };

  career = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as PlayerIdParam;
    const result = await this.getCareer.execute(id);
    res.status(StatusCodes.OK).json({ status: 'success', data: result });
  };

  gamelog = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as PlayerIdParam;
    const { season } = req.query as unknown as GameLogQuery;
    const result = await this.getGameLog.execute(id, season);
    res.status(StatusCodes.OK).json({ status: 'success', data: result });
  };

  teamStats = async (req: Request, res: Response): Promise<void> => {
    const { teamId, season } = req.query as unknown as TeamStatsQuery;
    const result = await this.getTeamStats.execute(teamId, season);
    res.status(StatusCodes.OK).json({ status: 'success', data: result });
  };
}
