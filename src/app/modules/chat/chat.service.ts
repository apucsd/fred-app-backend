import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { calculatePagination } from '../../utils/calculatePagination';
import { Prisma } from '@prisma/client';

const createChat = async (userId: string, payload: { participants: string[] }) => {
    const isExist = await prisma.chat.findFirst({
        where: {
            participants: {
                has: userId,
            },
        },
    });
    if (isExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Chat already exists');
    }
    const participants = Array.from(new Set([...payload.participants, userId]));

    const result = await prisma.chat.create({
        data: {
            participants,
        },
    });
    return result;
};

const getMyChats = async (userId: string, query: Record<string, any>) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query);
    const { searchTerm } = query;

    const andConditions: Prisma.ChatWhereInput[] = [{ participants: { has: userId } }];

    if (searchTerm) {
        const matchingUsers = await prisma.user.findMany({
            where: {
                name: {
                    contains: searchTerm as string,
                    mode: 'insensitive',
                },
            },
            select: { id: true },
        });
        const matchingUserIds = matchingUsers.map((u) => u.id);

        andConditions.push({
            participants: {
                hasSome: matchingUserIds,
            },
        });
    }

    const whereConditions: Prisma.ChatWhereInput = { AND: andConditions };

    const result = await prisma.chat.findMany({
        where: whereConditions,
        include: {
            messages: {
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
            },
        },
        orderBy: {
            [sortBy]: sortOrder,
        },
        skip,
        take: limit,
    });

    const total = await prisma.chat.count({ where: whereConditions });

    const populatedResult = await Promise.all(
        result.map(async (chat) => {
            const participantUsers = await prisma.user.findMany({
                where: {
                    id: { in: chat.participants },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profile: true,
                },
            });
            return {
                ...chat,
                participants: participantUsers,
            };
        })
    );

    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
        data: populatedResult,
    };
};

const getChatById = async (chatId: string, userId: string) => {
    const result = await prisma.chat.findUniqueOrThrow({
        where: {
            id: chatId,
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: 'asc',
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            profile: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });

    if (!result.participants.includes(userId)) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not a participant of this chat');
    }

    return result;
};

export const ChatServices = {
    createChat,
    getMyChats,
    getChatById,
};
