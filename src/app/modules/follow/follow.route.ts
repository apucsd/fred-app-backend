import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FollowController } from './follow.controller';
import { FollowValidation } from './follow.validation';
import { UserRoleEnum } from '@prisma/client';

const router = express.Router();

router.post(
    '/',
    auth(UserRoleEnum.USER, UserRoleEnum.BUSINESS, UserRoleEnum.SUPERADMIN),
    validateRequest.body(FollowValidation.toggleFollow),
    FollowController.toggleFollow
);

router.get(
    '/followers',
    auth(UserRoleEnum.USER, UserRoleEnum.BUSINESS, UserRoleEnum.SUPERADMIN),
    FollowController.getMyFollowers
);

router.get(
    '/following',
    auth(UserRoleEnum.USER, UserRoleEnum.BUSINESS, UserRoleEnum.SUPERADMIN),
    FollowController.getMyFollowing
);

export const FollowRoutes = router;
