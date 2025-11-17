import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FaqService } from './faq.service';
import httpStatus from 'http-status';

const createFaq = catchAsync(async (req, res) => {
    const result = await FaqService.createFaqIntoDB(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'Faq created successfully',
        data: result,
    });
});

const getAllFaqs = catchAsync(async (req, res) => {
    const result = await FaqService.getFaqsFromDB(req.query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Faqs retrieved successfully',
        data: result,
    });
});

const getFaqById = catchAsync(async (req, res) => {
    const result = await FaqService.getFaqFromDB(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Faq retrieved successfully',
        data: result,
    });
});

const updateFaq = catchAsync(async (req, res) => {
    const result = await FaqService.updateFaqInDB(req.params.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Faq updated successfully',
        data: result,
    });
});

const deleteFaq = catchAsync(async (req, res) => {
    const result = await FaqService.deleteFaqFromDB(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Faq deleted successfully',
        data: result,
    });
});

export const FaqController = {
    createFaq,
    getAllFaqs,
    getFaqById,
    updateFaq,
    deleteFaq,
};
