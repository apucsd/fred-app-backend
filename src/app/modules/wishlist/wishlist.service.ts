import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { IWishlist } from './wishlist.interface';
import httpStatus from 'http-status';

const addToWishlistInDB = async (userId: string, payload: IWishlist) => {
    const data: IWishlist = {
        userId,
        productId: payload.productId,
    } as IWishlist;

    const product = await prisma.product.findUnique({
        where: {
            id: data.productId,
        },
    });

    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
    }

    const existing = await prisma.wishlist.findFirst({
        where: {
            userId: data.userId,
            productId: data.productId,
        },
    });

    console.log('existing', existing);

    if (existing) {
        const deleted = await prisma.wishlist.delete({
            where: {
                id: existing.id,
                userId: existing.userId,
                productId: existing.productId,
            },
        });
        return { deleted, message: 'Product removed from wishlist' };
    }

    const result = await prisma.wishlist.create({
        data,
    });

    return { result, message: 'Product added to wishlist' };
};

const getMyWishlistFromDB = async (userId: string, query: Record<string, any>) => {
    const wishListQuery = new QueryBuilder(prisma.wishlist, { ...query, userId })
        .search(['user.name', 'product.title'])
        .include({ product: true, user: true })
        .paginate()
        .sort()
        .filter()
        .fields()
        .execute();

    return wishListQuery;
};

export const WishlistService = {
    addToWishlistInDB,
    getMyWishlistFromDB,
};
