import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { stripe } from '../../utils/stripe';
import config from '../../../config';

const createSubscriptionPaymentLink = async (userId: string, packageId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId, status: 'ACTIVE' },
    });

    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name ?? undefined,
            metadata: { userId },
        });

        stripeCustomerId = customer.id;

        await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId },
        });
    }

    const plan = await prisma.package.findUnique({
        where: { id: packageId, status: 'ACTIVE' },
    });

    if (!plan) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Package not found');
    }

    if (user.role !== plan.type) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User role does not match package type');
    }

    const existingSubscription = await prisma.subscription.findUnique({
        where: { userId_packageId: { userId, packageId } },
    });

    if (existingSubscription) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User already has a subscription for this package');
    }

    const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
            {
                price: plan.stripePriceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        subscription_data: {
            metadata: { userId, packageId },
        },
        success_url: `${config.base_url_client}/subscription/success`,
        cancel_url: `${config.base_url_client}/subscription/cancel`,
    });

    return {
        paymentUrl: session.url,
    };
};

const getMySubscriptionFromDB = async (userId: string) => {
    const isExistSubscription = await prisma.subscription.findMany({
        where: { userId: userId },
        include: {
            package: true,
        },
    });

    return isExistSubscription;
};

const cancelSubscriptionFromStripe = async (userId: string, packageId: string) => {
    const isExistSubscription = await prisma.subscription.findUnique({
        where: { userId_packageId: { userId, packageId } },
    });

    if (!isExistSubscription) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User does not have a subscription with this package');
    }

    const result = await stripe.subscriptions.cancel(isExistSubscription.stripeSubscriptionId);

    return result;
};

const upgradeSubscriptionFromStripeBilling = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId, status: 'ACTIVE' },
    });

    if (!user?.stripeCustomerId) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User not found do not have any subscription yet');
    }

    const currentSubscription = await prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: { package: true },
    });

    if (!currentSubscription) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User has no active subscription');
    }

    const configurationId =
        currentSubscription.package.type === 'BUSINESS'
            ? config.stripe.stripe_business_portal_config_id
            : config.stripe.stripe_user_portal_config_id;

    const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${config.base_url_client}/subscription`,
        configuration: configurationId,
    });

    return session.url;
};

export const SubscriptionService = {
    createSubscriptionPaymentLink,
    cancelSubscriptionFromStripe,
    upgradeSubscriptionFromStripeBilling,
    getMySubscriptionFromDB,
};
