import { Currency, UserRoleEnum } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { stripe } from '../../utils/stripe';
import { IPackage } from './package.interface';

const createPackageInToDB = async (payload: IPackage) => {
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
const getAllPackagesFromDB = async (id: string) => {
    const role = await prisma.user.findUnique({
        where: {
            id,
        },
    });
    const result = await prisma.package.findMany({
        where: {
            status: 'ACTIVE',
            type: role?.role,
        },
    });
    return result;
};
const getAdminAllPackagesFromDB = async () => {
    const result = await prisma.package.findMany({
        where: {
            status: 'ACTIVE',
        },
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
