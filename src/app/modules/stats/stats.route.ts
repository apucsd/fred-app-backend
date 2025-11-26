import { Router } from 'express';
import { StatsController } from './stats.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';

const router = Router();

router.get('/count', auth(UserRoleEnum.SUPERADMIN), StatsController.getAllStats);
router.get('/revenue', auth(UserRoleEnum.SUPERADMIN), StatsController.getMonthlyRevenue);
router.get('/user', auth(UserRoleEnum.SUPERADMIN), StatsController.getMonthlyUser);
router.get('/payments', auth(UserRoleEnum.SUPERADMIN), StatsController.getAllPayment);

export const statsRouters = router;
