import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PlaylistService } from './playlist.service';
import httpStatus from 'http-status';
const createPlaylist = catchAsync(async (req, res) => {
    req.body.userId = req.user.id;
    const playlist = await PlaylistService.createPlaylistInDB(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'Playlist created successfully',
        data: playlist,
    });
});

const getAllPlaylists = catchAsync(async (req, res) => {
    const playlists = await PlaylistService.getAllPlaylists(req.query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Playlists retrieved successfully',
        data: playlists,
    });
});

const getPlaylistById = catchAsync(async (req, res) => {
    const playlist = await PlaylistService.getPlaylistById(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Playlist retrieved successfully',
        data: playlist,
    });
});

const getPlaylistByUserId = catchAsync(async (req, res) => {
    const playlist = await PlaylistService.getPlaylistByUserId(req.params.userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Playlist retrieved successfully',
        data: playlist,
    });
});

const updatePlaylist = catchAsync(async (req, res) => {
    const playlist = await PlaylistService.updatePlaylistInDB(req.params.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Playlist updated successfully',
        data: playlist,
    });
});

const deletePlaylist = catchAsync(async (req, res) => {
    const playlist = await PlaylistService.deletePlaylistInDB(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Playlist deleted successfully',
        data: playlist,
    });
});

export const PlaylistController = {
    createPlaylist,
    getAllPlaylists,
    getPlaylistById,
    getPlaylistByUserId,
    updatePlaylist,
    deletePlaylist,
};
