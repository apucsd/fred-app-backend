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
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            // console.log('payment_intent.succeeded', paymentIntent);
            break;
        }

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const sessionId = paymentIntent.metadata?.paymentId;
            if (sessionId) {
                await prisma.payment.update({
                    where: { id: sessionId },
                    data: { status: 'FAILED' },
                });
            }
            console.log('payment_intent.payment_failed', paymentIntent);
            break;
        }

        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutSessionCompleted(session);
            break;
        }

        case 'checkout.session.expired': {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutSessionCanceled(session);
            break;
        }

        case 'customer.subscription.created': {
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionCreated(subscription as any);
            break;
        }
        case 'invoice.payment_failed': {
            await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);

            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;

            await prisma.subscription.update({
                where: { stripeSubscriptionId: subscription.id },
                data: {
                    status: 'CANCELED',
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                },
            });

            console.log(`Subscription ${subscription.id} canceled → DB updated`);
            break;
        }
        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;

            await prisma.subscription.update({
                where: { stripeSubscriptionId: subscription.id },
                data: {
                    status: 'ACTIVE',
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                },
            });

            console.log(`Subscription ${subscription.id} updated → DB updated`);
            break;
        }

        default: {
            return { status: 'unhandled_event', type: event.type };
        }
    }
};

export const checkout = async (data: { stripePriceId: string; email: string; paymentId: string }) => {
    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: `${config.base_url_client}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.base_url_client}/checkout/cancel?paymentId=${data.paymentId}`,
        line_items: [
            {
                price: data.stripePriceId,
                quantity: 1,
            },
        ],
        customer_email: data.email,
        metadata: {
            paymentId: data.paymentId,
        },
    });

    return session.url;
};

const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
    const paymentId = session.metadata?.paymentId;
    if (!paymentId) return;

    const stripePaymentId = session.payment_intent as string;
    const stripeCustomerId = session.customer as string | undefined;

    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId, {
        expand: ['latest_charge.payment_method_details'],
    });

    const charge = paymentIntent.latest_charge as Stripe.Charge | null;

    const card = charge?.payment_method_details?.type === 'card' ? charge.payment_method_details.card : undefined;

    await prisma.payment.update({
        where: { id: paymentId },
        data: {
            status: 'SUCCESS',
            stripeSessionId: session.id,
            stripePaymentId,
            stripeCustomerId,
            paymentMethodType: paymentIntent.payment_method_types?.[0],
            cardBrand: card?.brand,
            cardLast4: card?.last4,
            cardExpMonth: card?.exp_month,
            cardExpYear: card?.exp_year,
        },
    });

    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
    });
    return payment;
};

const handleCheckoutSessionCanceled = async (session: Stripe.Checkout.Session) => {
    const paymentId = session.metadata?.paymentId;
    if (!paymentId) return;

    await prisma.payment.update({
        where: { id: paymentId },
        data: {
            status: 'CANCELED',
            stripeSessionId: session.id,
        },
    });

    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
    });
    return payment;
};

const handleSubscriptionCreated = async (
    subscription: Stripe.Subscription & { current_period_start: number; current_period_end: number }
) => {
    const periodStart = subscription.current_period_start;
    const periodEnd = subscription.current_period_end;
    const priceId = subscription.items.data[0].price.id;
    const packageData = await prisma.package.findUnique({
        where: { stripePriceId: priceId },
    });

    if (!packageData) throw new Error('Package not found for subscription');

    const result = await prisma.subscription.create({
        data: {
            userId: subscription.metadata.user,
            packageId: packageData.id,
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            status: 'ACTIVE',
            currentPeriodStart: new Date(periodStart * 1000),
            currentPeriodEnd: new Date(periodEnd * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
    });

    return result;
};

const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
    const invoiceData = invoice as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription;
    };
    const subscriptionId =
        typeof invoiceData.subscription === 'string' ? invoiceData.subscription : invoiceData.subscription?.id;

    if (subscriptionId) {
        await prisma.subscription.update({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: 'PAST_DUE' },
        });
    }
};
