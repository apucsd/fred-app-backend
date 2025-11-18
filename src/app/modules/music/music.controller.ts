import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { uploadSingleFile } from '../../utils/uploadFiles';
import { uploadToDigitalOceanAWS } from '../../utils/uploadToDigitalOceanAWS';
import { MusicService } from './music.service';
import httpStatus from 'http-status';

const createMusic = catchAsync(async (req, res) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const audioFile = files?.['audio']?.[0];
    const imageFile = files?.['image']?.[0];
    if (!audioFile) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Audio is required');
    }
    if (!imageFile) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Image is required');
    }
    const audioLocation = await uploadToDigitalOceanAWS(audioFile);
    const imageLocation = await uploadToDigitalOceanAWS(imageFile);
    req.body.userId = req.user.id;
    req.body.audio = audioLocation.Location;
    req.body.image = imageLocation.Location;

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
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const audioFile = files?.['audio']?.[0];
    const imageFile = files?.['image']?.[0];
    if (audioFile) {
        const audioLocation = await uploadToDigitalOceanAWS(audioFile);
        req.body.audio = audioLocation.Location;
    }
    if (imageFile) {
        const imageLocation = await uploadToDigitalOceanAWS(imageFile);
        req.body.image = imageLocation.Location;
    }

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
};
