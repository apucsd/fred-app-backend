import { Notification } from '@prisma/client';

export interface INotification
    extends Pick<Notification, 'recipientId' | 'senderId' | 'message' | 'link' | 'isRead' | 'type'> {}
