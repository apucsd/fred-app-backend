import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { IEvent } from './event.interface';
import httpStatus from 'http-status';

const createEventInDB = async (event: IEvent) => {
    const result = await prisma.event.create({
        data: event,
    });
    return result;
};

const getAllEventsFromDB = async (query: Record<string, any>) => {
    const musicQuery = new QueryBuilder(prisma.event, query);
    const result = await musicQuery
        .search(['title', 'description'])
        .include({ user: true })
        .sort()
        .filter()
        .fields()
        .paginate()
        .execute();
    return result;
};

const getEventByIdFromDB = async (id: string) => {
    const result = await prisma.event.findUniqueOrThrow({
        where: {
            id,
        },
        include: {
            user: true,
        },
    });
    return result;
};

const updateEventInDB = async (id: string, event: IEvent) => {
    const existingEvent = await prisma.event.findUnique({
        where: {
            id,
        },
    });
    if (!existingEvent) {
        throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
    }

    const result = await prisma.event.update({
        where: {
            id,
        },
        data: event,
    });
    return result;
};

const deleteEventInDB = async (id: string) => {
    const result = await prisma.event.delete({
        where: {
            id,
        },
    });
    return result;
};

export const EventService = {
    createEventInDB,
    getAllEventsFromDB,
    getEventByIdFromDB,
    updateEventInDB,
    deleteEventInDB,
};
