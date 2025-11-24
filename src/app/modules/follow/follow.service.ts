import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';

const toggleFollowInDB = async (userId: string, followingId: string) => {
    if (userId === followingId) {
        throw new AppError(httpStatus.BAD_REQUEST, 'You cannot follow yourself');
    }
    const userToFollow = await prisma.user.findUnique({
        where: {
            id: followingId,
        },
    });

    if (!userToFollow) {
        throw new AppError(httpStatus.NOT_FOUND, 'User to follow not found');
    }

    const existingFollow = await prisma.follow.findFirst({
        where: {
            followerId: userId,
            followingId: followingId,
        },
    });

    if (existingFollow) {
        await prisma.follow.delete({
            where: {
                id: existingFollow.id,
            },
        });
        return { message: 'Unfollowed successfully' };
    } else {
        await prisma.follow.create({
            data: {
                followerId: userId,
                followingId: followingId,
            },
        });
        return { message: 'Followed successfully' };
    }
};

const getMyFollowersFromDB = async (userId: string, query: Record<string, any>) => {
    const followersQuery = new QueryBuilder(prisma.follow, { ...query, followingId: userId })
        .search(['follower.name', 'follower.email'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .include({
            follower: true,
        });

    const result = await followersQuery.execute();

    return result;
};

const getMyFollowingFromDB = async (userId: string, query: Record<string, any>) => {
    const followingQuery = new QueryBuilder(prisma.follow, { ...query, followerId: userId })
        .search(['following.name', 'following.email'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .include({
            following: true,
        });

    const result = await followingQuery.execute();

    return result;
};

export const FollowService = {
    toggleFollowInDB,
    getMyFollowersFromDB,
    getMyFollowingFromDB,
};
