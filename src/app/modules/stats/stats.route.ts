import { Router } from 'express';
import { StatsController } from './stats.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';

const router = Router();

router.get('/count', auth(UserRoleEnum.SUPERADMIN), StatsController.getAllStats);
router.get('/revenue', auth(UserRoleEnum.SUPERADMIN), StatsController.getMonthlyRevenue);
router.get('/user', auth(UserRoleEnum.SUPERADMIN), StatsController.getMonthlyUser);

export const statsRouters = router;
