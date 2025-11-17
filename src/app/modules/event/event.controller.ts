import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { uploadSingleFile } from '../../utils/uploadFiles';
import { EventService } from './event.service';
import httpStatus from 'http-status';

const createEvent = catchAsync(async (req, res) => {
    if (!req.file) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Image is required');
    }

    const location = uploadSingleFile(req.file);
    req.body.userId = req.user.id;
    req.body.image = location.url;
    const result = await EventService.createEventInDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Event created successfully',
        data: result,
    });
});

const getAllEvents = catchAsync(async (req, res) => {
    const result = await EventService.getAllEventsFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Events fetched successfully',
        data: result,
    });
});

const getEventById = catchAsync(async (req, res) => {
    const result = await EventService.getEventByIdFromDB(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event fetched successfully',
        data: result,
    });
});

const updateEvent = catchAsync(async (req, res) => {
    if (req.file && req.file.filename) {
        req.body.image = req.file.filename;
    }
    const result = await EventService.updateEventInDB(req.params.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event updated successfully',
        data: result,
    });
});

const deleteEvent = catchAsync(async (req, res) => {
    const result = await EventService.deleteEventInDB(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event deleted successfully',
        data: result,
    });
});
export const EventController = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
};
