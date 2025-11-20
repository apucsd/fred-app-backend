import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { WishlistService } from './wishlist.service';

const addToWishlist = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { result, message } = await WishlistService.addToWishlistInDB(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message,
        data: result,
    });
});

const getMyWishlist = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const result = await WishlistService.getMyWishlistFromDB(userId, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Wishlist retrieved successfully',
        data: result,
    });
});

export const WishlistController = {
    addToWishlist,
    getMyWishlist,
};
