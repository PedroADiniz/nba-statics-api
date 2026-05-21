import { Router } from 'express';
import { H2HController } from '../controllers/H2HController';
import { GetH2HAnalysisUseCase } from '../../application/usecases/GetH2HAnalysisUseCase';
import { NBAStatsGameRepository } from '../../infrastructure/repositories/NBAStatsGameRepository';
import { PrismaTeamRepository } from '../../infrastructure/repositories/PrismaTeamRepository';
import { NBAStatsHttpClient } from '../../infrastructure/http/NBAStatsHttpClient';
import { validate } from '../middlewares/validate.middleware';
import { h2hQuerySchema } from '../validators/h2h.validator';
import { h2hRateLimiter } from '../middlewares/rateLimiter.middleware';

const client = new NBAStatsHttpClient();
const gameRepo = new NBAStatsGameRepository(client);
const teamRepo = new PrismaTeamRepository();
const controller = new H2HController(new GetH2HAnalysisUseCase(gameRepo, teamRepo));

const router = Router();

router.get(
  '/',
  h2hRateLimiter,
  validate(h2hQuerySchema, 'query'),
  controller.analyze,
);

export default router;
