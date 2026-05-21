import { Router } from 'express';
import healthRoutes from './health.routes';
import teamsRoutes from './teams.routes';
import h2hRoutes from './h2h.routes';
import playersRoutes from './players.routes';
import scheduleRoutes from './schedule.routes';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use('/health', healthRoutes);

router.use(authMiddleware);

router.use('/teams', teamsRoutes);
router.use('/h2h', h2hRoutes);
router.use('/players', playersRoutes);
router.use('/schedule', scheduleRoutes);

export default router;
