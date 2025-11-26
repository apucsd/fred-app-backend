import httpStatus from 'http-status';
import { User, UserRoleEnum, UserStatus } from '@prisma/client';
import QueryBuilder from '../../builder/QueryBuilder';
import { prisma } from '../../utils/prisma';
import AppError from '../../errors/AppError';
import { uploadToDigitalOceanAWS } from '../../utils/uploadToDigitalOceanAWS';

// interface UserWithOptionalPassword extends Omit<User, 'password'> {
//   password?: string;
// }
const getAllUsersFromDB = async (query: any) => {
    const usersQuery = new QueryBuilder<typeof prisma.user>(prisma.user, query);
    const result = await usersQuery.search(['name', 'email']).filter().sort().fields().exclude().paginate().execute();

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
        },
    });
    const myAvgReview = await prisma.review.aggregate({
        where: {
            reviewedUserId: id,
        },
        _avg: {
            rating: true,
        },
    });
    return {
        ...user,
        avgReview: myAvgReview._avg.rating,
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

export const UserServices = {
    getAllUsersFromDB,
    getMyProfileFromDB,
    getUserDetailsFromDB,
    updateMyProfileIntoDB,
    updateUserRoleStatusIntoDB,
    updateProfileStatus,
    updateProfileImg,
};
