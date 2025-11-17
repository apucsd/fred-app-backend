import { TicketStatus } from '@prisma/client';
import z from 'zod';

const createSupportTicketSchema = z.object({
    body: z.object({
        subject: z.string().min(3, 'Subject must be at least 3 characters long'),
        message: z.string().min(3, 'Message must be at least 3 characters long'),
    }),
});

const updateSupportTicketSchema = z.object({
    body: z.object({
        status: z.nativeEnum(TicketStatus),
        response: z.string().min(3, 'Response must be at least 3 characters long'),
    }),
});

export const SupportTicketValidation = {
    createSupportTicketSchema,
    updateSupportTicketSchema,
};
