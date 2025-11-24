import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { Message } from '@prisma/client';
import { calculatePagination } from '../../utils/calculatePagination';

const sendMessage = async (senderId: string, payload: Message) => {
    const findChat = await prisma.chat.findUnique({
        where: {
            id: payload.chatId,
            participants: {
                has: senderId,
            },
        },
    });
    if (!findChat) {
        throw new AppError(httpStatus.NOT_FOUND, 'You are not a participant or chat does not exist');
    }
    const message = await prisma.message.create({
        data: {
            ...payload,
            senderId,
        },
    });
    await prisma.chat.update({
        where: { id: payload.chatId },
        data: { lastMessageId: message.id },
    });
    return message;
};

const getAllMessageByChatId = async (me: string, chatId: string, cursor?: string) => {
    const findChat = await prisma.chat.findUnique({
        where: {
            id: chatId,
            participants: {
                has: me,
            },
        },
    });
    if (!findChat) {
        throw new AppError(httpStatus.NOT_FOUND, 'You are not a participant or chat does not exist');
    }

    const PAGE_SIZE = 20;

    const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'desc' },
        take: PAGE_SIZE,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
    });

    return messages;
};

const markMessagesAsRead = async (chatId: string, userId: string) => {
    const messages = await prisma.message.updateMany({
        where: { chatId, senderId: { not: userId }, isRead: false },
        data: { isRead: true },
    });

    return messages;
};

const deleteMessage = async (messageId: string, userId: string) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId, senderId: userId },
    });

    if (!message) {
        throw new AppError(httpStatus.NOT_FOUND, 'Message not found');
    }
    const deletedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { isDeleted: true },
    });
    return deletedMessage;
};

export const MessageServices = {
    sendMessage,
    getAllMessageByChatId,
    markMessagesAsRead,
    deleteMessage,
};
