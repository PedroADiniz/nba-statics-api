import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NBAScheduleService } from '../../infrastructure/services/NBAScheduleService';
import { ScheduleQuery } from '../validators/schedule.validator';
import { NotFoundError } from '../../shared/errors/AppError';

export class ScheduleController {
  constructor(private readonly scheduleService: NBAScheduleService) {}

  byDate = async (req: Request, res: Response): Promise<void> => {
    const { date } = req.query as unknown as ScheduleQuery;
    const games = await this.scheduleService.getByDate(date);
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { date, games },
    });
  };

  dates = async (_req: Request, res: Response): Promise<void> => {
    const dates = await this.scheduleService.getAllDates();
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { dates },
    });
  };

  gameDetail = async (req: Request, res: Response): Promise<void> => {
    const { gameId } = req.params;
    const detail = await this.scheduleService.getGameDetail(gameId);
    if (!detail) throw new NotFoundError(`Jogo ${gameId} não encontrado`);
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: detail,
    });
  };
}
