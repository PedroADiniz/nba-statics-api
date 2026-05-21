import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GetTeamsUseCase } from '../../application/usecases/GetTeamsUseCase';
import { GetTeamByIdUseCase } from '../../application/usecases/GetTeamByIdUseCase';
import { TeamsQuery, TeamIdParam } from '../validators/teams.validator';

export class TeamsController {
  constructor(
    private readonly getTeams: GetTeamsUseCase,
    private readonly getTeamById: GetTeamByIdUseCase,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as TeamsQuery;
    const teams = await this.getTeams.execute({ conference: query.conference });
    res.status(StatusCodes.OK).json({ status: 'success', data: teams, total: teams.length });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const params = req.params as unknown as TeamIdParam;
    const team = await this.getTeamById.execute(params.id);
    res.status(StatusCodes.OK).json({ status: 'success', data: team });
  };
}
