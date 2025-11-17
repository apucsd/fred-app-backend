import { TicketStatus } from '@prisma/client';

export interface ISupportTicket {
    id: string;
    userId: string;
    subject: string;
    message: string;
    status: TicketStatus;
    response?: string;
    createdAt: Date;
    updatedAt: Date;
}
