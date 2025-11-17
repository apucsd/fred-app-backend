import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SupportTicketService } from './support-ticket.service';

const createSupportTicket = catchAsync(async (req, res) => {
    req.body.userId = req.user.id;
    const result = await SupportTicketService.createSupportTicketInDB(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'Support ticket created successfully',
        data: result,
    });
});

const getSupportTicketsForAdmin = catchAsync(async (req, res) => {
    const result = await SupportTicketService.getSupportTicketsFromDB(req.query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Support tickets fetched successfully',
        data: result,
    });
});

const getMySupportTickets = catchAsync(async (req, res) => {
    const result = await SupportTicketService.getMySupportTicketsFromDB(req.user.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Support tickets fetched successfully',
        data: result,
    });
});
const getSupportTicket = catchAsync(async (req, res) => {
    const result = await SupportTicketService.getSupportTicketFromDB(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Support ticket fetched successfully',
        data: result,
    });
});

const updateSupportTicket = catchAsync(async (req, res) => {
    const result = await SupportTicketService.updateSupportTicketInDB(req.params.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Support ticket updated successfully',
        data: result,
    });
});

const deleteSupportTicket = catchAsync(async (req, res) => {
    const result = await SupportTicketService.deleteSupportTicketInDB(req.params.id, req.user.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Support ticket deleted successfully',
        data: result,
    });
});
export const SupportTicketController = {
    createSupportTicket,
    getSupportTicketsForAdmin,
    getMySupportTickets,
    getSupportTicket,
    updateSupportTicket,
    deleteSupportTicket,
};
