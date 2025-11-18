import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { deleteFromDigitalOceanAWS, uploadToDigitalOceanAWS } from '../../utils/uploadToDigitalOceanAWS';
import { IMusic } from './music.interface';
import httpStatus from 'http-status';
const createMusicInDB = async (music: IMusic, files: Express.Multer.File[]) => {
    const allFiles = files as unknown as { [fieldname: string]: Express.Multer.File[] };

    const audioFile = allFiles?.['audio']?.[0];
    const imageFile = allFiles?.['image']?.[0];
    if (!audioFile) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Audio is required');
    }
    if (!imageFile) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Image is required');
    }
    const { Location: audioLocation } = await uploadToDigitalOceanAWS(audioFile);
    const { Location: imageLocation } = await uploadToDigitalOceanAWS(imageFile);
    music.audio = audioLocation;
    music.image = imageLocation;
    const result = await prisma.music.create({
        data: music,
    });
    return result;
};

const getAllMusicFromDB = async (query: Record<string, any>) => {
    const musicQuery = new QueryBuilder(prisma.music, query);
    const result = await musicQuery
        .search(['title', 'subtitle', 'author'])
        .include({ user: true })
        .sort()
        .filter()
        .fields()
        .paginate()
        .execute();
    return result;
};

const getMusicByIdFromDB = async (id: string) => {
    const result = await prisma.music.findUniqueOrThrow({
        where: {
            id,
        },
        include: {
            user: true,
        },
    });
    return result;
};

const updateMusicInDB = async (id: string, payload: Partial<IMusic>, files: Express.Multer.File[]) => {
    const existingMusic = await prisma.music.findUnique({
        where: {
            id,
        },
    });
    if (!existingMusic) {
        throw new AppError(httpStatus.NOT_FOUND, 'Music not found');
    }

    const allFiles = files as unknown as { [fieldname: string]: Express.Multer.File[] };
    const audioFile = allFiles?.['audio']?.[0];
    const imageFile = allFiles?.['image']?.[0];
    if (audioFile) {
        const audioLocation = await uploadToDigitalOceanAWS(audioFile);
        await deleteFromDigitalOceanAWS(existingMusic.audio);
        payload.audio = audioLocation.Location;
    }
    if (imageFile) {
        const imageLocation = await uploadToDigitalOceanAWS(imageFile);
        await deleteFromDigitalOceanAWS(existingMusic.image);
        payload.image = imageLocation.Location;
    }

    const result = await prisma.music.update({
        where: {
            id,
        },
        data: payload,
    });
    return result;
};

const deleteMusicInDB = async (id: string) => {
    // find music by id
    const existingMusic = await prisma.music.findUnique({
        where: {
            id,
        },
    });
    if (!existingMusic) {
        throw new AppError(httpStatus.NOT_FOUND, 'Music not found');
    }
    if (existingMusic.audio) {
        await deleteFromDigitalOceanAWS(existingMusic.audio);
    }
    if (existingMusic.image) {
        await deleteFromDigitalOceanAWS(existingMusic.image);
    }
    const result = await prisma.music.delete({
        where: {
            id,
        },
    });
    return result;
};

export const MusicService = {
    createMusicInDB,
    getAllMusicFromDB,
    getMusicByIdFromDB,
    updateMusicInDB,
    deleteMusicInDB,
};
