import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MusicService } from './music.service';
import httpStatus from 'http-status';

const createMusic = catchAsync(async (req, res) => {
    req.body.userId = req.user.id;
    const result = await MusicService.createMusicInDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Music created successfully',
        data: result,
    });
});

const getAllMusic = catchAsync(async (req, res) => {
    const result = await MusicService.getAllMusicFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Music fetched successfully',
        data: result,
    });
});

const getMusicByPlaylistId = catchAsync(async (req, res) => {
    const result = await MusicService.getMusicByPlaylistId(req.params.playlistId, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Music fetched successfully',
        data: result,
    });
});

const getMusicById = catchAsync(async (req, res) => {
    const result = await MusicService.getMusicByIdFromDB(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Music fetched successfully',
        data: result,
    });
});

const updateMusic = catchAsync(async (req, res) => {
    const result = await MusicService.updateMusicInDB(req.params.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Music updated successfully',
        data: result,
    });
});

const deleteMusic = catchAsync(async (req, res) => {
    const result = await MusicService.deleteMusicInDB(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Music deleted successfully',
        data: result,
    });
});

export const MusicController = {
    createMusic,
    getAllMusic,
    getMusicById,
    updateMusic,
    deleteMusic,
    getMusicByPlaylistId,
};
