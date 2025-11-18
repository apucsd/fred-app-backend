import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { deleteFromDigitalOceanAWS } from '../../utils/uploadToDigitalOceanAWS';
import { IMusic } from './music.interface';
import httpStatus from 'http-status';
const createMusicInDB = async (music: IMusic) => {
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

const updateMusicInDB = async (id: string, payload: Partial<IMusic>) => {
    const music = await prisma.music.findUnique({
        where: {
            id,
        },
    });
    if (!music) {
        throw new AppError(httpStatus.NOT_FOUND, 'Music not found');
    }

    if (payload.audio) {
        await deleteFromDigitalOceanAWS(music.audio);
    }
    if (payload.image) {
        await deleteFromDigitalOceanAWS(music.image);
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
    const music = await prisma.music.findUnique({
        where: {
            id,
        },
    });
    if (!music) {
        throw new AppError(httpStatus.NOT_FOUND, 'Music not found');
    }
    if (music.audio) {
        await deleteFromDigitalOceanAWS(music.audio);
    }
    if (music.image) {
        await deleteFromDigitalOceanAWS(music.image);
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
