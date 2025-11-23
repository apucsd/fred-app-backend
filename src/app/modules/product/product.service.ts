import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import {
    deleteMultipleFilesFromDigitalOceanAWS,
    uploadMultipleFilesToDigitalOceanAWS,
} from '../../utils/uploadToDigitalOceanAWS';
import { IProduct } from './product.interface';
import httpStatus from 'http-status';

const createProductInDB = async (product: IProduct, files: Express.Multer.File[]) => {
    if (!files || files.length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Minimum one image is required');
    }

    const uploadResults = await uploadMultipleFilesToDigitalOceanAWS(files);
    const imageUrls = uploadResults.map((result) => result.Location);

    product.images = imageUrls;

    const result = await prisma.product.create({
        data: product,
    });

    return result;
};

const updateProductInDB = async (
    id: string,
    removeImages: string[] = [],
    payload: Partial<IProduct>,
    files: Express.Multer.File[] = []
) => {
    const existing = await prisma.product.findUnique({
        where: { id, status: 'ACTIVE' },
    });

    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
    }

    const imagesToKeep = existing.images.filter((img) => !removeImages.includes(img));

    const uploadResults = files.length ? await uploadMultipleFilesToDigitalOceanAWS(files) : [];
    const newImageUrls = uploadResults.map((r) => r.Location);

    const finalImages = [...imagesToKeep, ...newImageUrls];

    const result = await prisma.product.update({
        where: { id, status: 'ACTIVE' },
        data: {
            ...payload,
            images: finalImages,
        },
    });

    const imagesToDelete = existing.images.filter((img) => removeImages.includes(img));
    if (imagesToDelete.length) {
        await deleteMultipleFilesFromDigitalOceanAWS(imagesToDelete);
    }

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
