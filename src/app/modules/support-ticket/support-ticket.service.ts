import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { ISupportTicket } from './support-ticket.interface';
import QueryBuilder from '../../builder/QueryBuilder';

const createSupportTicketInDB = async (data: ISupportTicket) => {
    const supportTicket = await prisma.supportTicket.create({
        data,
    });
    return supportTicket;
};

const getSupportTicketsFromDB = async (query: Record<string, any>) => {
    const supportQuery = new QueryBuilder(prisma.supportTicket, query);
    const result = await supportQuery
        .search(['subject', 'message', 'response'])
        .include({ user: true })
        .sort()
        .filter()
        .fields()
        .exclude()
        .paginate()
        .execute();

    return result;
};

const getMySupportTicketsFromDB = async (id: string) => {
    const supportTickets = await prisma.supportTicket.findMany({
        where: {
            userId: {
                equals: id,
            },
        },
    });
    return supportTickets;
};
const getSupportTicketFromDB = async (id: string) => {
    const supportTicket = await prisma.supportTicket.findUnique({
        where: {
            id,
        },
    });
    return supportTicket;
};

const updateSupportTicketInDB = async (id: string, data: ISupportTicket) => {
    const supportTicket = await prisma.supportTicket.update({
        where: {
            id,
        },
        data,
    });
    return supportTicket;
};

const deleteSupportTicketInDB = async (id: string, userId: string) => {
    const ticket = await prisma.supportTicket.findUnique({
        where: { id },
    });

    if (!ticket) {
        throw new AppError(httpStatus.NOT_FOUND, 'Support ticket not found');
    }

    if (ticket.userId !== userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized to delete this support ticket');
    }

    const deletedTicket = await prisma.supportTicket.delete({
        where: { id },
    });

    return deletedTicket;
};

export const SupportTicketService = {
    createSupportTicketInDB,
    getSupportTicketsFromDB,
    getMySupportTicketsFromDB,
    getSupportTicketFromDB,
    updateSupportTicketInDB,
    deleteSupportTicketInDB,
};
