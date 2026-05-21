import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GetH2HAnalysisUseCase } from '../../application/usecases/GetH2HAnalysisUseCase';
import { H2HQuery } from '../validators/h2h.validator';

export class H2HController {
  constructor(private readonly getH2HAnalysis: GetH2HAnalysisUseCase) {}

  analyze = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as H2HQuery;

    const result = await this.getH2HAnalysis.execute({
      team1Id: query.team1Id,
      team2Id: query.team2Id,
      startDate: query.startDate,
      endDate: query.endDate,
      includeQuarters: query.includeQuarters,
    });

    res.status(StatusCodes.OK).json({ status: 'success', data: result });
  };
}
