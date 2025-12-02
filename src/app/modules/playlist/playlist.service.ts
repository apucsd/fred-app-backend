import { Playlist } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
const createPlaylistInDB = async (playlist: Playlist) => {
    return await prisma.$transaction(async (txn) => {
        const user = await txn.user.findUnique({ where: { id: playlist.userId, status: 'ACTIVE' } });
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, 'User not found');
        }
        const subscription = await txn.subscription.findUnique({ where: { userId: playlist.userId } });
        if (!subscription) {
            throw new AppError(httpStatus.NOT_FOUND, 'You did not subscribe to our service');
        }
        if (subscription.status !== 'ACTIVE') {
            throw new AppError(httpStatus.BAD_REQUEST, 'Please upgrade your subscription to create a playlist');
        }
        return await txn.playlist.create({ data: playlist });
    });
};

const getAllPlaylists = async (query: Record<string, any>) => {
    const playListQuery = new QueryBuilder(prisma.playlist, { ...query, status: 'ACTIVE' });
    const playlists = await playListQuery
        .search(['name', 'description'])
        .filter()
        .include({
            user: {
                select: {
                    id: true,
                    name: true,
                    profile: true,
                },
            },
            music: {
                select: {
                    id: true,
                    title: true,
                },
            },
        })
        .sort()
        .paginate()
        .execute();
    return playlists;
};

const getPlaylistById = async (id: string) => {
    return await prisma.playlist.findUnique({ where: { id, status: 'ACTIVE' } });
};

const getPlaylistByUserId = async (userId: string) => {
    return await prisma.playlist.findMany({ where: { userId, status: 'ACTIVE' } });
};

const updatePlaylistInDB = async (id: string, playlist: Playlist) => {
    const res = await prisma.playlist.update({ where: { id, status: 'ACTIVE' }, data: playlist });
    if (!res) {
        throw new AppError(httpStatus.NOT_FOUND, 'Playlist not found');
    }
    return res;
};

const deletePlaylistInDB = async (id: string) => {
    const res = await prisma.playlist.delete({ where: { id, status: 'ACTIVE' } });
    if (!res) {
        throw new AppError(httpStatus.NOT_FOUND, 'Playlist not found');
    }
    return res;
};

export const PlaylistService = {
    createPlaylistInDB,
    getAllPlaylists,
    getPlaylistById,
    getPlaylistByUserId,
    updatePlaylistInDB,
    deletePlaylistInDB,
};
