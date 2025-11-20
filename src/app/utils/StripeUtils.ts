import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import catchAsync from './catchAsync';
import sendResponse from './sendResponse';
import Stripe from 'stripe';
import config from '../../config';
import { prisma } from './prisma';
import { stripe } from './stripe';

export const StripeWebHook = catchAsync(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
        throw new AppError(httpStatus.NOT_FOUND, 'Missing Stripe signature');
    }
    const result = await StripeHook(req.body, sig);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Webhook processed successfully',
        data: result,
    });
});

const StripeHook = async (rawBody: Buffer, signature: string | string[] | undefined) => {
    let event: Stripe.Event;

    // Step 1: Verify signature
    try {
        event = stripe.webhooks.constructEvent(rawBody, signature as string, config.stripe.stripe_webhook as string);
    } catch (err) {
        throw new AppError(httpStatus.BAD_REQUEST, `Webhook signature verification failed: ${(err as Error).message}`);
    }

    switch (event.type) {
        case 'customer.subscription.created': {
            const subscription = event.data.object as Stripe.Subscription & {
                current_period_start: number;
                current_period_end: number;
            };
            await handleSubscriptionCreated(subscription);
            break;
        }

        default: {
            return { status: 'unhandled_event', type: event.type };
        }
    }
};

const handleSubscriptionCreated = async (
    subscription: Stripe.Subscription & { current_period_start: number; current_period_end: number }
) => {
    // console.log('Subscription created', subscription);
    const { userId, packageId } = subscription.metadata;
    const subscriptionPackage = await prisma.package.findUnique({ where: { id: packageId } });

    await prisma.$transaction(async (tx) => {
        const subscriptionCreate = await tx.subscription.create({
            data: {
                userId,
                packageId,
                periodStart: new Date(subscription.current_period_start * 1000),
                periodEnd: new Date(subscription.current_period_end * 1000),
                stripeSubscriptionId: subscription.id,
                status: 'ACTIVE',
            },
        });
        const paymentCreate = await tx.payment.create({
            data: {
                userId,
                packageId,
                amount: subscriptionPackage?.price!,
                currency: 'usd',
                paymentMethod: 'STRIPE',
                subscriptionId: (await subscriptionCreate).id,
                chargeId: subscription.id,
                status: 'COMPLETED',
                invoiceId: subscription.id,
            },
        });
    });
    console.log('Subscription and Payment created');

    return { status: 'success', type: 'customer.subscription.created' };
};
