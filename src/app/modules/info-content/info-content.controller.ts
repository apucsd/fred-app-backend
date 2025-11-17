import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { InfoContentService } from './info-content.service';

const createInfoContent = catchAsync(async (req, res) => {
    const result = await InfoContentService.createInfoContentInDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Info Content created / updated successfully',
        data: result,
    });
});

const getAllInfoContent = catchAsync(async (req, res) => {
    const result = await InfoContentService.getAllInfoContentFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Info Content fetched successfully',
        data: result,
    });
});

export const InfoContentController = {
    createInfoContent,
    getAllInfoContent,
};
