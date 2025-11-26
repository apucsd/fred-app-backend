import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatsService } from './stats.service';
import httpStatus from 'http-status';

const getAllStats = catchAsync(async (req, res) => {
    const stats = await StatsService.getAllStatsFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Stats retrieved successfully',
        data: stats,
    });
});

const getMonthlyUser = catchAsync(async (req, res) => {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const stats = await StatsService.getMonthlyUser(year);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Monthly user retrieved successfully',
        data: stats,
    });
});

const getMonthlyRevenue = catchAsync(async (req, res) => {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const stats = await StatsService.getMonthlyRevenue(year);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Monthly revenue retrieved successfully',
        data: stats,
    });
});

export const StatsController = {
    getAllStats,
    getMonthlyUser,
    getMonthlyRevenue,
};
