import { prisma } from '../../utils/prisma';
import { IReview } from './review.interface';
import QueryBuilder from '../../builder/QueryBuilder';

const createReview = async (review: IReview) => {
    const result = await prisma.review.create({
        data: review,
    });
    return result;
};

const getReviews = async (query: Record<string, any>, userId: string) => {
    const reviewQuery = new QueryBuilder(prisma.review, { ...query, userId });
    const result = await reviewQuery
        .search(['comment'])
        .include({
            user: true,
            product: true,
        })
        .filter()
        .sort()
        .fields()
        .exclude()
        .paginate()
        .execute();
    return result;
};

const getSingleReview = async (id: string) => {
    const result = await prisma.review.findUnique({
        where: { id },
        include: {
            user: true,
            product: true,
        },
    });
    return result;
};

const updateReview = async (id: string, review: Partial<IReview>) => {
    const result = await prisma.review.update({
        where: { id },
        data: review,
        include: {
            user: true,
            product: true,
        },
    });
    return result;
};

const deleteReview = async (id: string) => {
    const result = await prisma.review.delete({
        where: { id },
    });
    return result;
};

export const ReviewService = {
    createReview,
    getReviews,
    getSingleReview,
    updateReview,
    deleteReview,
};
