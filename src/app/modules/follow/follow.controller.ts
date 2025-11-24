import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FollowService } from './follow.service';

const toggleFollow = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { followingId } = req.body;
    const result = await FollowService.toggleFollowInDB(userId, followingId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
    });
});

const getMyFollowers = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const result = await FollowService.getMyFollowersFromDB(userId, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Followers retrieved successfully',
        data: result,
    });
});

const getMyFollowing = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const result = await FollowService.getMyFollowingFromDB(userId, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Following retrieved successfully',
        data: result,
    });
});

export const FollowController = {
    toggleFollow,
    getMyFollowers,
    getMyFollowing,
};
