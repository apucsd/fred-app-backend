import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick';
import { reviewFilterableFields } from './review.validation';
import { ReviewService } from './review.service';
import { IReview } from './review.interface';

const createReview = catchAsync(async (req: Request, res: Response) => {
    const reviewData: IReview = req.body;
    const result = await ReviewService.createReview(reviewData);
    res.status(httpStatus.CREATED).json({
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'Review created successfully',
        data: result,
    });
});

const getReviews = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, reviewFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await ReviewService.getReviews(filters, paginationOptions);

    res.status(httpStatus.OK).json({
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

    res.status(httpStatus.OK).json({
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

    res.status(httpStatus.OK).json({
        success: true,
        statusCode: httpStatus.OK,
        message: 'Review updated successfully',
        data: result,
    });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ReviewService.deleteReview(id);

    res.status(httpStatus.OK).json({
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
