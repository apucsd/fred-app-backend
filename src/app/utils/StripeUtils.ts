import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import catchAsync from './catchAsync';
import sendResponse from './sendResponse';
import Stripe from 'stripe';
import config from '../../config';
import { prisma } from './prisma';
import { stripe } from './stripe';
import { SubscriptionStatus } from '@prisma/client';

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

    try {
        event = stripe.webhooks.constructEvent(rawBody, signature as string, config.stripe.stripe_webhook as string);
    } catch (err) {
        throw new AppError(httpStatus.BAD_REQUEST, `Webhook signature verification failed: ${(err as Error).message}`);
    }

    switch (event.type) {
        case 'invoice.payment_succeeded':
            await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
            break;

        case 'customer.subscription.created':
            await handleSubscriptionCreated(
                event.data.object as Stripe.Subscription & {
                    current_period_start: number;
                    current_period_end: number;
                }
            );
            break;

        case 'customer.subscription.updated':
            await handleSubscriptionUpdated(
                event.data.object as Stripe.Subscription & {
                    current_period_start: number;
                    current_period_end: number;
                }
            );
            break;

        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
            break;

        default:
            return { status: 'unhandled_event', type: event.type };
    }
};

// -------------------------------------------------------
//  PAYMENT SUCCESS → Create Subscription + Payment
// -------------------------------------------------------
const handleInvoicePaymentSucceeded = async (invoice: Stripe.Invoice) => {
    const subscriptionId = (invoice as any).subscription as string;
    const stripeCustomerId = (invoice as any).customer as string;

    const user = await prisma.user.findUnique({
        where: { stripeCustomerId },
    });

    if (!user) return;

    const line = invoice.lines.data[0] as any;

    const metadata = line?.metadata || invoice.metadata;

    const userId = metadata?.userId;
    const packageId = metadata?.packageId;

    if (!userId || !packageId) return;

    const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;

    const periodStart = new Date(subscription.billing_cycle_anchor * 1000);

    let periodEnd = new Date(periodStart);
    const plan = subscription.items.data[0].plan;

    switch (plan.interval) {
        case 'month':
            periodEnd.setMonth(periodEnd.getMonth() + plan.interval_count);
            break;
        case 'year':
            periodEnd.setFullYear(periodEnd.getFullYear() + plan.interval_count);
            break;
        case 'week':
            periodEnd.setDate(periodEnd.getDate() + 7 * plan.interval_count);
            break;
        case 'day':
            periodEnd.setDate(periodEnd.getDate() + plan.interval_count);
            break;
    }

    await prisma.$transaction(async (tx) => {
        const createdSub = await tx.subscription.create({
            data: {
                userId,
                packageId,
                stripeSubscriptionId: subscription.id,
                periodStart,
                periodEnd,
                status: 'ACTIVE',
            },
        });

        await tx.payment.create({
            data: {
                userId,
                packageId,
                subscriptionId: createdSub.id,
                currency: invoice.currency.toUpperCase(),
                amount: invoice.amount_paid / 100,
                paymentMethod: 'STRIPE',
                status: 'COMPLETED',
                invoiceId: invoice.id,
            },
        });
    });

    console.log(`Payment created successfully for ${user?.name}`);

    return;
};

// -------------------------------------------------------
//  subscription.created (IGNORE incomplete)
// -------------------------------------------------------
const handleSubscriptionCreated = async (
    subscription: Stripe.Subscription & { current_period_start: number; current_period_end: number }
) => {
    if (subscription.status === 'incomplete') return;

    console.log('Subscription created successfully');

    return;
};

// -------------------------------------------------------
//  subscription.updated → Update DB Status
// -------------------------------------------------------
const mapStripeStatus = (status: Stripe.Subscription.Status): SubscriptionStatus => {
    const statusMap: Record<string, SubscriptionStatus> = {
        active: 'ACTIVE',
        trialing: 'TRIALING',
        past_due: 'INACTIVE',
        unpaid: 'INACTIVE',
        canceled: 'CANCELLED',
    };

    return statusMap[status] ?? 'INACTIVE';
};

const handleSubscriptionUpdated = async (
    subscription: Stripe.Subscription & { current_period_start: number; current_period_end: number }
) => {
    const stripeSubId = subscription.id;

    const existingSub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: stripeSubId },
    });

    if (!existingSub) return;

    await prisma.subscription.update({
        where: { stripeSubscriptionId: stripeSubId },
        data: {
            status: mapStripeStatus(subscription.status),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            cancelAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
            periodStart: new Date(subscription.current_period_start * 1000),
            periodEnd: new Date(subscription.current_period_end * 1000),
        },
    });

    console.log(`Subscription updated successfully for ${existingSub.userId}`);

    return;
};

// -------------------------------------------------------
//  subscription.deleted → Final Cancel
// -------------------------------------------------------
const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
    const stripeSubId = subscription.id;

    const existingSub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: stripeSubId },
    });

    if (!existingSub) return;

    await prisma.subscription.update({
        where: { stripeSubscriptionId: stripeSubId },
        data: {
            status: 'CANCELLED',
            cancelAt: new Date(subscription.canceled_at ? subscription.canceled_at * 1000 : Date.now()),
        },
    });

    console.log(`Subscription deleted successfully for ${existingSub.userId}`);

    return;
};
