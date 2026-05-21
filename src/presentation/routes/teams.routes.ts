import { Router } from 'express';
import { TeamsController } from '../controllers/TeamsController';
import { GetTeamsUseCase } from '../../application/usecases/GetTeamsUseCase';
import { GetTeamByIdUseCase } from '../../application/usecases/GetTeamByIdUseCase';
import { PrismaTeamRepository } from '../../infrastructure/repositories/PrismaTeamRepository';
import { validate } from '../middlewares/validate.middleware';
import { teamsQuerySchema, teamIdParamSchema } from '../validators/teams.validator';

const repo = new PrismaTeamRepository();
const controller = new TeamsController(
  new GetTeamsUseCase(repo),
  new GetTeamByIdUseCase(repo),
);

const router = Router();

router.get('/', validate(teamsQuerySchema, 'query'), controller.list);
router.get('/:id', validate(teamIdParamSchema, 'params'), controller.getById);

export default router;
