import { prisma } from '../../utils/prisma';
import { IReview } from './review.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const createReview = async (me: string, review: IReview) => {
    const isReviewExist = await prisma.review.findUnique({
        where: {
            reviewAuthorId: me,
            reviewedUserId: review.reviewedUserId,
        },
    });

    if (isReviewExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Review already exists');
    }

    const result = await prisma.review.create({
        data: review,
    });

    return result;
};

const getReviews = async (query: Record<string, any>, userId: string) => {
    const reviewQuery = new QueryBuilder(prisma.review, { ...query, reviewAuthorId: userId });
    const result = await reviewQuery
        .search(['comment'])
        .include({
            reviewedUser: {
                select: {
                    id: true,
                    name: true,
                    profile: true,
                },
            },
            reviewAuthor: {
                select: {
                    id: true,
                    name: true,
                    profile: true,
                },
            },
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
            reviewedUser: {
                select: {
                    id: true,
                    name: true,
                    profile: true,
                },
            },
            reviewAuthor: {
                select: {
                    id: true,
                    name: true,
                    profile: true,
                },
            },
        },
    });
    return result;
};

const updateReview = async (id: string, review: Partial<IReview>) => {
    const result = await prisma.review.update({
        where: { id },
        data: review,
        include: {
            reviewedUser: {
                select: {
                    id: true,
                    name: true,
                    profile: true,
                },
            },
            reviewAuthor: {
                select: {
                    id: true,
                    name: true,
                    profile: true,
                },
            },
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
