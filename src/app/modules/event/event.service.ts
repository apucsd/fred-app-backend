import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { deleteFromDigitalOceanAWS, uploadToDigitalOceanAWS } from '../../utils/uploadToDigitalOceanAWS';
import { IEvent } from './event.interface';
import httpStatus from 'http-status';

const createEventInDB = async (event: IEvent, file: Express.Multer.File) => {
    if (file && file.fieldname !== 'image') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Image is required');
    }
    const { Location } = await uploadToDigitalOceanAWS(file);
    event.image = Location;
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

const updateEventInDB = async (id: string, event: IEvent, file: Express.Multer.File) => {
    const existingEvent = await prisma.event.findUnique({
        where: {
            id,
        },
    });
    if (!existingEvent) {
        throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
    }

    if (file && file.fieldname == 'image') {
        const { Location } = await uploadToDigitalOceanAWS(file);
        await deleteFromDigitalOceanAWS(existingEvent.image);
        event.image = Location;
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
    if (result.image) {
        await deleteFromDigitalOceanAWS(result.image);
    }
    return result;
};

export const EventService = {
    createEventInDB,
    getAllEventsFromDB,
    getEventByIdFromDB,
    updateEventInDB,
    deleteEventInDB,
};
