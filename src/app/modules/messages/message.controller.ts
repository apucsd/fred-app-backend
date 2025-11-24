import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MessageServices } from './message.service';

const sendMessage = catchAsync(async (req, res) => {
    const senderId = req.user.id;
    const result = await MessageServices.sendMessage(senderId as string, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'Message sent successfully',
        data: result,
    });
});

const getAllMessageByChatId = catchAsync(async (req, res) => {
    const me = req.user.id;
    const chatId = req.params.id;

    const result = await MessageServices.getAllMessageByChatId(
        me as string,
        chatId as string,
        req.query.cursor as string
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Conversation fetched successfully',
        data: result,
    });
});

const markMessagesAsRead = catchAsync(async (req, res) => {
    const chatId = req.params.id;
    const userId = req.user?.id;

    const result = await MessageServices.markMessagesAsRead(chatId as string, userId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Message marked as read',
        data: result,
    });
});

const deleteMessage = catchAsync(async (req, res) => {
    const messageId = req.params.id;
    const userId = req.user?.id;

    const result = await MessageServices.deleteMessage(messageId as string, userId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Message deleted successfully',
        data: result,
    });
});

export const MessageControllers = {
    sendMessage,
    getAllMessageByChatId,
    markMessagesAsRead,
    deleteMessage,
};
