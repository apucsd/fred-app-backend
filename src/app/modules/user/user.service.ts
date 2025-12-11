import httpStatus from 'http-status';
import { User, UserRoleEnum, UserStatus } from '@prisma/client';
import QueryBuilder from '../../builder/QueryBuilder';
import { prisma } from '../../utils/prisma';
import AppError from '../../errors/AppError';
import { uploadToDigitalOceanAWS } from '../../utils/uploadToDigitalOceanAWS';
import { stripe } from '../../utils/stripe';
import config from '../../../config';

// interface UserWithOptionalPassword extends Omit<User, 'password'> {
//   password?: string;
// }
const getAllUsersFromDB = async (query: any) => {
    const usersQuery = new QueryBuilder<typeof prisma.user>(prisma.user, query);
    const result = await usersQuery.search(['name', 'email']).filter().sort().fields().exclude().paginate().execute();

    return result;
};

// }
const getBusinessUsersFromDB = async (query: any) => {
    const result = await new QueryBuilder<typeof prisma.user>(prisma.user, {
        ...query,
        role: UserRoleEnum.BUSINESS,
        status: UserStatus.ACTIVE,
    })
        .search(['name', 'email'])
        .filter()
        .sort()
        .fields()
        .exclude()
        .paginate()
        .customFields({
            id: true,
            name: true,
            email: true,
            role: true,
            bio: true,
            profile: true,
        })
        .execute();
    const userIds = result.data.map((item: User) => item.id);

    // 1. Get avg rating per user
    const ratings = await prisma.review.groupBy({
        by: ['reviewedUserId'],
        _avg: {
            rating: true,
        },
        _count: {
            rating: true,
        },
        where: {
            reviewedUserId: { in: userIds },
        },
    });

    // 2. Map userId → avgRating
    const ratingMap = Object.fromEntries(ratings.map((r) => [r.reviewedUserId, r._avg.rating]));

    // 3. Attach avgRating to each user
    result.data = result.data.map((user: User) => ({
        ...user,
        avgRating: ratingMap[user.id] ?? 0,
    }));

    return result;
};

const getMyProfileFromDB = async (id: string) => {
    const Profile = await prisma.user.findUniqueOrThrow({
        where: {
            id: id,
        },
    });
    const myAvgReview = await prisma.review.aggregate({
        where: {
            reviewAuthorId: id,
        },
        _avg: {
            rating: true,
        },
    });

    return {
        ...Profile,
        avgReview: myAvgReview._avg.rating,
    };
};

const getUserDetailsFromDB = async (id: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            profile: true,
            // reviews: true,
        },
    });
    const myAvgReview = await prisma.review.aggregate({
        where: {
            reviewedUserId: id,
        },
        _avg: {
            rating: true,
        },
        _count: {
            rating: true,
        },
    });
    return {
        ...user,
        avgReview: myAvgReview._avg?.rating,
        totalReview: myAvgReview._count?.rating,
    };
};

const updateProfileImg = async (id: string, file: Express.Multer.File | undefined) => {
    if (!file || file.fieldname !== 'image') {
        throw new AppError(httpStatus.NOT_FOUND, 'Please provide image');
    }

    const { Location } = await uploadToDigitalOceanAWS(file);
    const result = await prisma.user.update({
        where: {
            id,
        },
        data: {
            profile: Location,
        },
    });
    return result;
};

const updateMyProfileIntoDB = async (
    id: string,

    payload: Partial<User>
) => {
    delete payload.email;

    const result = await prisma.user.update({
        where: {
            id,
        },
        data: payload,
    });
    return result;
};

const updateUserRoleStatusIntoDB = async (id: string, role: UserRoleEnum) => {
    const result = await prisma.user.update({
        where: {
            id: id,
        },
        data: {
            role: role,
        },
    });
    return result;
};
const updateProfileStatus = async (id: string, status: UserStatus) => {
    const result = await prisma.user.update({
        where: {
            id,
        },
        data: {
            status,
        },
        select: {
            id: true,
            status: true,
            role: true,
        },
    });
    return result;
};

// =============CONNECT STRIPE ACCOUNT WITH USER============
const connectStripeAccount = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId, status: 'ACTIVE' },
    });

    if (!user) throw new AppError(httpStatus.BAD_REQUEST, 'User not found');

    if (user.role !== 'BUSINESS')
        throw new AppError(httpStatus.BAD_REQUEST, 'Only business accounts can connect Stripe.');

    let stripeAccountId = user.stripeAccountId;

    if (!stripeAccountId) {
        const account = await stripe.accounts.create({
            type: 'express',
            email: user.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });

        stripeAccountId = account.id;

        await prisma.user.update({
            where: { id: userId },
            data: { stripeAccountId },
        });
    }

    const link = await stripe.accountLinks.create({
        account: stripeAccountId,
        type: 'account_onboarding', // ← Just always use this
        refresh_url: `${config.base_url_client}/stripe/refresh`,
        return_url: `${config.base_url_client}/dashboard`,
    });

    return link.url;
};

export const UserServices = {
    getAllUsersFromDB,
    getMyProfileFromDB,
    getUserDetailsFromDB,
    updateMyProfileIntoDB,
    updateUserRoleStatusIntoDB,
    updateProfileStatus,
    updateProfileImg,
    getBusinessUsersFromDB,
    connectStripeAccount,
};
