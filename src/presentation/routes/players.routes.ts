import { Router } from 'express';
import { PlayersController } from '../controllers/PlayersController';
import { GetRosterByTeamUseCase } from '../../application/usecases/GetRosterByTeamUseCase';
import { GetPlayerByIdUseCase } from '../../application/usecases/GetPlayerByIdUseCase';
import { GetPlayerCareerUseCase } from '../../application/usecases/GetPlayerCareerUseCase';
import { GetPlayerGameLogUseCase } from '../../application/usecases/GetPlayerGameLogUseCase';
import { GetTeamSeasonStatsUseCase } from '../../application/usecases/GetTeamSeasonStatsUseCase';
import { NBAStatsPlayerRepository } from '../../infrastructure/repositories/NBAStatsPlayerRepository';
import { NBAStatsHttpClient } from '../../infrastructure/http/NBAStatsHttpClient';
import { validate } from '../middlewares/validate.middleware';
import {
  rosterQuerySchema,
  playerIdSchema,
  gameLogQuerySchema,
  teamStatsQuerySchema,
} from '../validators/players.validator';

const client = new NBAStatsHttpClient();
const playerRepo = new NBAStatsPlayerRepository(client);

const controller = new PlayersController(
  new GetRosterByTeamUseCase(playerRepo),
  new GetPlayerByIdUseCase(playerRepo),
  new GetPlayerCareerUseCase(playerRepo),
  new GetPlayerGameLogUseCase(playerRepo),
  new GetTeamSeasonStatsUseCase(playerRepo),
);

const router = Router();

// GET /api/v1/players?teamId=1610612738&season=2024-25
router.get('/', validate(rosterQuerySchema, 'query'), controller.roster);

// GET /api/v1/players/stats?teamId=1610612738&season=2024-25
router.get('/stats', validate(teamStatsQuerySchema, 'query'), controller.teamStats);

// GET /api/v1/players/:id
router.get('/:id', validate(playerIdSchema, 'params'), controller.profile);

// GET /api/v1/players/:id/career
router.get('/:id/career', validate(playerIdSchema, 'params'), controller.career);

// GET /api/v1/players/:id/gamelog?season=2024-25
router.get('/:id/gamelog', validate(playerIdSchema, 'params'), validate(gameLogQuerySchema, 'query'), controller.gamelog);

export default router;
