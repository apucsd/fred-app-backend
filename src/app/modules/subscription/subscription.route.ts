import { Router } from 'express';
import { SubscriptionController } from './subscription.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { SubscriptionValidation } from './subscription.validation';

const router = Router();

router.post(
    '/',
    auth(UserRoleEnum.USER, UserRoleEnum.BUSINESS),
    validateRequest.body(SubscriptionValidation.createSubscriptionPaymentLinkSchema),
    SubscriptionController.createSubscriptionPaymentLink
);
router.get('/', auth(UserRoleEnum.USER, UserRoleEnum.BUSINESS), SubscriptionController.getMySubscription);

router.patch(
    '/cancel',
    auth(UserRoleEnum.USER, UserRoleEnum.BUSINESS),
    validateRequest.body(SubscriptionValidation.cancelSubscriptionFromStripeSchema),
    SubscriptionController.cancelSubscriptionFromStripe
);
// router.patch('/upgrade', auth(UserRoleEnum.USER, UserRoleEnum.BUSINESS), SubscriptionController.upgradeSubscription);

export const SubscriptionRouters = router;
