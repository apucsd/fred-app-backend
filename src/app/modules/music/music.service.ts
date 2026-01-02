import { Music } from '@prisma/client';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import httpStatus from 'http-status';
const createMusicInDB = async (music: Music) => {
    const user = await prisma.user.findUnique({
        where: { id: music.userId, status: 'ACTIVE' },
    });
    if (!user) throw new AppError(httpStatus.NOT_FOUND, 'Active user not found');
    const playlist = await prisma.playlist.findFirst({
        where: {
            id: music.playlistId,
            userId: music.userId,
            status: 'ACTIVE',
        },
    });
    if (!playlist) throw new AppError(httpStatus.FORBIDDEN, 'Playlist not found or not active');

    const subscription = await prisma.subscription.findFirst({
        where: {
            userId: music.userId,
            status: 'ACTIVE',
        },
    });
    if (!subscription) {
        throw new AppError(httpStatus.PAYMENT_REQUIRED, 'Active subscription required to upload music');
    }

    return await prisma.music.create({
        data: music,
    });
};

const getAllMusicFromDB = async (query: Record<string, any>) => {
    const musicQuery = new QueryBuilder(prisma.music, query);
    const result = await musicQuery
        .search(['title', 'subtitle', 'artist'])
        .include({
            user: {
                select: {
                    id: true,
                    name: true,
                    profile: true,
                },
            },
            playlist: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    coverImage: true,
                },
            },
        })
        .sort()
        .filter()
        .fields()
        .paginate()
        .execute();
    return result;
};
const getMyMusicFromDB = async (userId: string, query: Record<string, any>) => {
    const musicQuery = new QueryBuilder(prisma.music, { ...query, userId });
    const result = await musicQuery
        .search(['title', 'subtitle', 'artist'])
        .include({
            user: {
                select: {
                    id: true,
                    name: true,
                    profile: true,
                },
            },
            playlist: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    coverImage: true,
                },
            },
        })
        .sort()
        .filter()
        .fields()
        .paginate()
        .execute();
    return result;
};
const getMusicByPlaylistId = async (playlistId: string, query: Record<string, any>) => {
    const musicQuery = new QueryBuilder(prisma.music, { ...query, playlistId });
    const result = await musicQuery
        .search(['title', 'subtitle', 'artist'])
        .include({
            user: {
                select: {
                    id: true,
                    name: true,
                    profile: true,
                },
            },
            playlist: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    coverImage: true,
                },
            },
        })
        .sort()
        .filter()
        .fields()
        .paginate()
        .execute();
    return result;
};

const getMusicByIdFromDB = async (id: string) => {
    return await prisma.$transaction(async (transactionClient) => {
        const music = await transactionClient.music.findUniqueOrThrow({
            where: {
                id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profile: true,
                    },
                },
                playlist: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        coverImage: true,
                    },
                },
            },
        });
        await transactionClient.music.update({
            where: {
                id,
            },
            data: {
                totalPlays: music.totalPlays + 1,
            },
        });
        return music;
    });
};

const updateMusicInDB = async (id: string, payload: Partial<Music>) => {
    const existingMusic = await prisma.music.findUnique({
        where: {
            id,
        },
    });
    if (!existingMusic) {
        throw new AppError(httpStatus.NOT_FOUND, 'Music not found');
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
    getMusicByPlaylistId,
    getMyMusicFromDB,
};
