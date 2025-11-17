import { Router } from 'express';
import { InfoContentController } from './info-content.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { InfoContentValidation } from './info-content.validation';

const router = Router();

router.post(
    '/',
    auth(UserRoleEnum.SUPERADMIN),
    validateRequest.body(InfoContentValidation.createInfoContentValidation),
    InfoContentController.createInfoContent
);
router.get('/', InfoContentController.getAllInfoContent);

export const InfoContentRouters = router;
