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

router.patch(
    '/cancel',
    auth(UserRoleEnum.USER, UserRoleEnum.BUSINESS),
    validateRequest.body(SubscriptionValidation.cancelSubscriptionFromStripeSchema),
    SubscriptionController.cancelSubscriptionFromStripe
);

export const SubscriptionRouters = router;
