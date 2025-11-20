import { Subscription } from '@prisma/client';

export interface ISubscription
    extends Pick<
        Subscription,
        | 'id'
        | 'userId'
        | 'packageId'
        | 'periodStart'
        | 'periodEnd'
        | 'stripeSubscriptionId'
        | 'cancelAt'
        | 'cancelAtPeriodEnd'
        | 'paymentStatus'
        | 'status'
        | 'createdAt'
        | 'updatedAt'
    > {}
