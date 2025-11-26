import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { ReviewService } from './review.service';
import { IReview } from './review.interface';
import sendResponse from '../../utils/sendResponse';

const createReview = catchAsync(async (req: Request, res: Response) => {
    const reviewData: IReview = req.body;

    const result = await ReviewService.createReview(req.user.id, reviewData);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Review created successfully',
        data: result,
    });
});

const getReviews = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.getReviews(req.query, req.user.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Reviews retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getSingleReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ReviewService.getSingleReview(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Review retrieved successfully',
        data: result,
    });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const result = await ReviewService.updateReview(id, updateData);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Review updated successfully',
        data: result,
    });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ReviewService.deleteReview(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Review deleted successfully',
        data: result,
    });
});

export const ReviewController = {
    createReview,
    getReviews,
    getSingleReview,
    updateReview,
    deleteReview,
};
