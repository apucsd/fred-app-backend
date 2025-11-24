import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';

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

const getMyChats = async (userId: string) => {
    const result = await prisma.chat.findMany({
        where: {
            participants: {
                has: userId,
            },
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
    return result;
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
