import { Playlist } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { stripe } from '../../utils/stripe';
import config from '../../../config';
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

        if (playlist.price) {
            if (!user.stripeAccountId) {
                throw new AppError(httpStatus.BAD_REQUEST, 'For selling playlist, please connect your stripe account');
            }
            const acct = await stripe.accounts.retrieve(user.stripeAccountId!);
            console.log(acct);

            if (!acct.charges_enabled) {
                throw new AppError(httpStatus.BAD_REQUEST, 'Please complete your stripe connected account onboarding');
            }
            if (!acct.payouts_enabled) {
                throw new AppError(
                    httpStatus.BAD_REQUEST,
                    'Your Stripe account cannot receive payouts yet. Verification in progress.'
                );
            }
        }
        return await txn.playlist.create({ data: playlist });
    });
};

const getAllPlaylists = async (userId: string, query: Record<string, any>) => {
    const myPurchases = await prisma.playlistPurchase.findMany({ where: { userId } });

    const purchasedIds = new Set(myPurchases.map((purchase) => purchase.playlistId));
    console.log(purchasedIds);

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
    const updatedPlaylist = playlists.data.map((playlist: Playlist) => {
        const hasPurchased = purchasedIds.has(playlist.id);
        return {
            ...playlist,
            isPaid: playlist.price > 0 && hasPurchased,
            isUnlocked: playlist.price === 0 || hasPurchased,
            requiresPayment: playlist.price > 0 && !hasPurchased,
        };
    });
    return {
        ...playlists,
        data: updatedPlaylist,
    };
};

const createPlaylistPaymentLink = async (playlist: Playlist, buyerId: string, sellerId: string) => {
    const seller = await prisma.user.findUnique({ where: { id: sellerId } });
    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    const stripeAccountId = seller?.stripeAccountId;

    if (!stripeAccountId) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Playlist owner has not connected Stripe.');
    }

    const session = await stripe.checkout.sessions.create(
        {
            mode: 'payment',
            success_url: `${config.base_url_client}/playlist/${playlist.id}?paid=true`,
            cancel_url: `${config.base_url_client}/playlist/${playlist.id}`,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: playlist.name,
                            description: playlist.description,
                        },
                        unit_amount: playlist.price * 100,
                    },
                    quantity: 1,
                },
            ],
            customer_email: buyer?.email,
            metadata: {
                playlistId: playlist.id,
                buyerId,
            },
        },
        { stripeAccount: stripeAccountId }
    );

    return session.url;
};

const getPlaylistById = async (id: string, userId: string) => {
    const playlist = await prisma.playlist.findFirst({
        where: { id, status: 'ACTIVE' },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profile: true,
                },
            },
            music: true,
        },
    });

    if (!playlist) {
        throw new AppError(httpStatus.NOT_FOUND, 'Playlist not found');
    }

    if (playlist.price === 0) {
        await prisma.playlist.update({
            where: { id },
            data: { views: { increment: 1 } },
        });

        return {
            playlist,
        };
    }

    const purchase = await prisma.playlistPurchase.findFirst({
        where: { playlistId: id, userId },
    });

    if (purchase) {
        await prisma.playlist.update({
            where: { id },
            data: { views: { increment: 1 } },
        });

        return {
            playlist,
        };
    }

    const paymentUrl = await createPlaylistPaymentLink(playlist, userId, playlist.userId);

    return {
        paymentUrl,
    };
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
