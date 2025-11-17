import { prisma } from '../../utils/prisma';
import { IEvent } from './event.interface';

const createEventInDB = async (event: IEvent) => {
    const result = await prisma.event.create({
        data: event,
    });
    return result;
};

const getAllEventsFromDB = async () => {
    const result = await prisma.event.findMany({
        include: {
            user: true,
        },
    });
    return result;
};

const getEventByIdFromDB = async (id: string) => {
    const result = await prisma.event.findUniqueOrThrow({
        where: {
            id,
        },
    });
    return result;
};

const updateEventInDB = async (id: string, event: IEvent) => {
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
