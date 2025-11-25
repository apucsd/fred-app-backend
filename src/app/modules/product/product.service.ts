import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { IProduct } from './product.interface';
import httpStatus from 'http-status';

const createProductInDB = async (product: IProduct) => {
    const result = await prisma.product.create({
        data: product,
    });

    return result;
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
