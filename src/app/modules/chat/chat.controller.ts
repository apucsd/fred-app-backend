import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ChatServices } from './chat.service';

const createChat = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const result = await ChatServices.createChat(userId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'Chat created successfully',
        data: result,
    });
});

const getMyChats = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const result = await ChatServices.getMyChats(userId, req.query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Chats fetched successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getChatById = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await ChatServices.getChatById(id, userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Chat fetched successfully',
        data: result,
    });
});

export const ChatControllers = {
    createChat,
    getMyChats,
    getChatById,
};
