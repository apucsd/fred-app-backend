import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { IProduct } from './product.interface';
import httpStatus from 'http-status';

const createProductInDB = async (product: IProduct) => {
    const subscription = await prisma.subscription.findUnique({
        where: { userId: product.userId },
        include: { package: true },
    });

    if (!subscription) {
        throw new AppError(httpStatus.NOT_FOUND, 'You dont have any subscription plan to create product');
    }

    const pkg = subscription.package;

    if (!pkg) {
        throw new AppError(httpStatus.NOT_FOUND, 'Subscription package not found');
    }

    const productCount = await prisma.product.count({
        where: { userId: product.userId },
    });

    if (pkg.productLimit !== -1 && productCount >= pkg.productLimit) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'You have reached the product limit. Please upgrade your subscription plan'
        );
    }

    return prisma.product.create({
        data: product,
    });
};

const updateProductInDB = async (id: string, payload: Partial<IProduct>) => {
    const existing = await prisma.product.findUnique({
        where: { id, status: 'ACTIVE' },
    });

    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
    }

    const result = await prisma.product.update({
        where: { id, status: 'ACTIVE' },
        data: payload,
    });

    return result;
};
const getAllProductsFromDB = async (query: Record<string, any>) => {
    const productQuery = new QueryBuilder(prisma.product, { ...query, status: 'ACTIVE' });
    const result = await productQuery
        .search(['title', 'description'])
        .include({
            category: {
                select: {
                    id: true,
                    title: true,
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    profile: true,
                },
            },
            reviews: {
                select: {
                    id: true,
                    feedback: true,
                    rating: true,
                },
            },
        })
        .sort()
        .paginate()
        .filter()
        .fields()
        .execute();

    return result;
};

const getSingleProductFromDB = async (id: string) => {
    const result = await prisma.product.findUniqueOrThrow({
        where: {
            id,
            status: 'ACTIVE',
        },
        include: {
            category: true,
            user: true,
        },
    });
    return result;
};

const deleteProductFromDB = async (id: string) => {
    const result = await prisma.product.update({
        where: {
            id,
        },
        data: {
            status: 'INACTIVE',
        },
    });
    return result;
};

export const ProductService = {
    createProductInDB,
    getAllProductsFromDB,
    getSingleProductFromDB,
    deleteProductFromDB,
    updateProductInDB,
};
