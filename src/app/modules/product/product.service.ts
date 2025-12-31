import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { IProduct } from './product.interface';
import httpStatus from 'http-status';

const createProductInDB = async (product: IProduct) => {
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id: product.userId, status: 'ACTIVE' },
        });

        if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

        const category = await tx.category.findUnique({
            where: { id: product.categoryId },
        });

        if (!category) throw new AppError(httpStatus.NOT_FOUND, 'Category not found');

        const subscription = await tx.subscription.findUnique({
            where: { userId: product.userId },
            include: { package: true },
        });

        if (!subscription) throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');

        const pkg = subscription.package;

        if (!pkg) throw new AppError(httpStatus.NOT_FOUND, 'Package not found');

        const productCount = await tx.product.count({
            where: { userId: product.userId },
        });

        if (pkg.productLimit !== -1 && productCount >= pkg.productLimit)
            throw new AppError(
                httpStatus.FORBIDDEN,
                'You have reached the product limit. Please upgrade your subscription plan'
            );

        return tx.product.create({ data: product });
    });

    return result;
};

const updateProductInDB = async (id: string, payload: Partial<IProduct> & { removeImages?: string[] }) => {
    return await prisma.$transaction(async (tx) => {
        const existing = await tx.product.findUnique({
            where: { id, status: 'ACTIVE' },
            select: { images: true },
        });

        if (!existing) {
            throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
        }

        let updatedImages = [...existing.images];

        if (payload.removeImages?.length) {
            updatedImages = updatedImages.filter((img) => !payload.removeImages!.includes(img));
        }

        if (payload.images?.length) {
            updatedImages.push(...payload.images);
        }

        updatedImages = Array.from(new Set(updatedImages));

        const { removeImages, ...dataToUpdate } = payload;

        return await tx.product.update({
            where: { id },
            data: {
                ...dataToUpdate,
                images: updatedImages,
            },
        });
    });
};
const getAllProductsFromDB = async (userId: string, query: Record<string, any>) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'You are not authorized to access this resource');
    }

    // Check subscription
    const subscription = await prisma.subscription.findUnique({
        where: { userId },
        include: { package: true },
    });

    // Discount percent only for USER role
    const discountPercent = user.role === 'USER' ? (subscription?.package?.discountPercent ?? 0) : 0;

    // Fetch products

    const userWishList = await prisma.wishlist.findMany({
        where: {
            userId: userId,
        },
        select: {
            productId: true,
        },
    });

    const wishlistProductIds = new Set(userWishList.map((wishlist) => wishlist.productId));

    const queryParams: any = {
        ...query,
        status: 'ACTIVE',
    };

    if (user.role === 'USER') {
        queryParams.isApproved = true;
    }

    const productQuery = new QueryBuilder(prisma.product, queryParams);

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
        })
        .sort()
        .paginate()
        .filter()
        .fields()
        .execute();

    // Add discounted price to each product
    const updatedProducts = result.data.map((product: any) => {
        const price = product.price;

        const discountedPrice = discountPercent > 0 ? price - (price * discountPercent) / 100 : price;

        return {
            ...product,
            price,
            discountPercent,
            discountedPrice: Number(discountedPrice.toFixed(2)),
            isWishlisted: wishlistProductIds.has(product.id),
        };
    });

    return {
        ...result,
        data: updatedProducts,
    };
};

const getSpecificUserProducts = async (me: string, specificUser: string, query: Record<string, any>) => {
    const user = await prisma.user.findUnique({
        where: { id: me, status: 'ACTIVE' },
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check subscription
    const subscription = await prisma.subscription.findUnique({
        where: { userId: me, status: 'ACTIVE' },
        include: { package: true },
    });

    // Discount percent only for USER role
    const discountPercent = user.role === 'USER' ? (subscription?.package?.discountPercent ?? 0) : 0;

    const userWishList = await prisma.wishlist.findMany({
        where: {
            userId: me,
        },
        select: {
            productId: true,
        },
    });

    const wishlistProductIds = new Set(userWishList.map((wishlist) => wishlist.productId));

    // Fetch products
    const productQuery = new QueryBuilder(prisma.product, {
        ...query,
        status: 'ACTIVE',
        userId: specificUser,
        isApproved: true,
    });

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
        })
        .sort()
        .paginate()
        .filter()
        .fields()
        .execute();

    // Add discounted price to each product
    const updatedProducts = result.data.map((product: any) => {
        const price = product.price;

        const discountedPrice = discountPercent > 0 ? price - (price * discountPercent) / 100 : price;

        return {
            ...product,
            price,
            discountPercent,
            discountedPrice: Number(discountedPrice.toFixed(2)),
            isWishlisted: wishlistProductIds.has(product.id),
        };
    });

    return {
        ...result,
        data: updatedProducts,
    };
};

const getSingleProductFromDB = async (me: string, id: string) => {
    const user = await prisma.user.findUnique({
        where: { id: me, status: 'ACTIVE' },
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'You are not authorized to access this resource');
    }
    const subscription = await prisma.subscription.findUnique({
        where: { userId: me, status: 'ACTIVE' },
        include: { package: true },
    });

    const discountPercent = user.role === 'USER' ? (subscription?.package?.discountPercent ?? 0) : 0;

    const result = await prisma.product.findUniqueOrThrow({
        where: {
            id,
            status: 'ACTIVE',
            isApproved: true,
        },
        include: {
            category: {
                select: {
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
        },
    });

    const price = result.price;
    const discountedPrice = discountPercent > 0 ? price - (price * discountPercent) / 100 : price;
    return {
        ...result,
        price,
        discountPercent,
        discountedPrice: Number(discountedPrice.toFixed(2)),
    };
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

const approveProduct = async (id: string) => {
    const result = await prisma.product.update({
        where: {
            id,
        },
        data: {
            isApproved: true,
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
    getSpecificUserProducts,
    approveProduct,
};
