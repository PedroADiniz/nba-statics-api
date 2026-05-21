import { Router } from 'express';
import { ScheduleController } from '../controllers/ScheduleController';
import { NBAScheduleService } from '../../infrastructure/services/NBAScheduleService';
import { NBAStatsHttpClient } from '../../infrastructure/http/NBAStatsHttpClient';
import { validate } from '../middlewares/validate.middleware';
import { scheduleQuerySchema } from '../validators/schedule.validator';

const statsClient = new NBAStatsHttpClient();
const service = new NBAScheduleService(statsClient);
const controller = new ScheduleController(service);

const router = Router();

// GET /api/v1/schedule?date=YYYY-MM-DD
router.get('/', validate(scheduleQuerySchema, 'query'), controller.byDate);

// GET /api/v1/schedule/dates  — all dates that have games
router.get('/dates', controller.dates);

// GET /api/v1/schedule/game/:gameId — detailed box score for a single game
router.get('/game/:gameId', controller.gameDetail);

export default router;
