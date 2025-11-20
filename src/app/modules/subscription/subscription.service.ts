import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { stripe } from '../../utils/stripe';
import config from '../../../config';

const createSubscriptionPaymentLink = async (userId: string, packageId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

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
        success_url: config.base_url_client + '/subscription/success',
        cancel_url: config.base_url_client + '/subscription/cancel',
    });

    return result.url;
};

export const SubscriptionService = {
    createSubscriptionPaymentLink,
};
