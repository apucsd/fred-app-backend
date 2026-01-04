import { Currency, UserRoleEnum } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { stripe } from '../../utils/stripe';
import { IPackage } from './package.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
const createPackageInToDB = async (payload: IPackage) => {
    const type = payload.type;
    if (type === UserRoleEnum.USER) {
        if (!payload.discountPercent) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Discount percent is required for USER packages');
        }
    }
    if (type === UserRoleEnum.BUSINESS) {
        if (!payload.productLimit || !payload.eventLimit) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Product limit and event limit is required for BUSINESS packages'
            );
        }
    }

    const product = await stripe.products.create({
        name: payload.name,
        description: payload.description,
        type: 'service',
    });

    const price = await stripe.prices.create({
        product: product.id,
        recurring: {
            interval: payload.interval,
        },
        unit_amount: payload.price * 100,
        currency: (payload.currency as Currency) || 'usd',
    });

    const result = await prisma.package.create({
        data: {
            ...payload,
            stripePriceId: price.id,
            stripeProductId: product.id,
        },
    });
    return result;
};
const getAllPackagesFromDB = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
            status: 'ACTIVE',
        },
    });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    const myActivePlan = await prisma.subscription.findFirst({
        where: {
            userId,
            status: 'ACTIVE',
        },
    });

    const result = await prisma.package.findMany({
        where: {
            status: 'ACTIVE',
            type: user?.role,
        },
    });

    const packages = result.map((pkg) => ({
        ...pkg,
        isActivePlan: myActivePlan?.packageId === pkg.id,
    }));

    return packages;
};
const getAdminAllPackagesFromDB = async (query: Record<string, string>) => {
    let whereCondition: any = {
        status: 'ACTIVE',
    };
    if (query.type) {
        whereCondition.type = query.type;
    }
    const result = await prisma.package.findMany({
        where: whereCondition,
    });
    return result;
};
const getPackageByIdFromDB = async (id: string, userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    const whereCondition: any = {
        id,
        status: 'ACTIVE',
    };

    if (user?.role !== UserRoleEnum.SUPERADMIN) {
        whereCondition.type = user?.role;
    }

    const result = await prisma.package.findUnique({
        where: whereCondition,
    });
    return result;
};
const updatePackageInToDB = async (id: string, payload: IPackage) => {
    const result = await prisma.package.update({
        where: {
            id,
        },
        data: payload,
    });
    return result;
};
const deletePackageInToDB = async (id: string) => {
    const result = await prisma.package.update({
        where: {
            id,
        },
        data: {
            status: 'INACTIVE',
        },
    });
    return result;
};
export const packageServices = {
    createPackageInToDB,
    getAllPackagesFromDB,
    getAdminAllPackagesFromDB,
    getPackageByIdFromDB,
    updatePackageInToDB,
    deletePackageInToDB,
};
