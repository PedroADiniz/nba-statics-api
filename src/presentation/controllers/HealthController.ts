import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class HealthController {
  check = (_req: Request, res: Response): void => {
    res.status(StatusCodes.OK).json({
      status: 'success',
      service: 'nba-h2h-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  };
}
