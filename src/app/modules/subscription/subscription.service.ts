import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { stripe } from '../../utils/stripe';
import config from '../../../config';

const createSubscriptionPaymentLink = async (userId: string, packageId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId, status: 'ACTIVE' } });

    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
    }

    const isExistPackage = await prisma.package.findUnique({ where: { id: packageId, status: 'ACTIVE' } });

    if (!isExistPackage) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Package not found');
    }

    if (user.role !== isExistPackage.type) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User role is not match with package type');
    }

    const isExistSubscription = await prisma.subscription.findUnique({
        where: { userId_packageId: { userId, packageId } },
    });

    if (isExistSubscription) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User already have a subscription with this package');
    }

    const result = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: user.email,
        line_items: [
            {
                price: isExistPackage.stripePriceId,
                quantity: 1,
            },
        ],

        mode: 'subscription',
        subscription_data: {
            metadata: {
                userId,
                packageId,
            },
        },
        success_url: config.base_url_client + '/subscription/success',
        cancel_url: config.base_url_client + '/subscription/cancel',
    });

    return result.url;
};

export const SubscriptionService = {
    createSubscriptionPaymentLink,
};
