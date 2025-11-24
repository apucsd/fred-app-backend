import QueryBuilder from '../../builder/QueryBuilder';
import { prisma } from '../../utils/prisma';
import { sendEventToUser } from '../../utils/ws-server';
import { INotification } from './notification.interface';

const createNotificationToDB = async (payload: INotification) => {
    const notification = await prisma.notification.create({
        data: payload,
    });
    sendEventToUser(`notification::${payload.recipientId}`, notification);
    return notification;
};

const getUserNotifications = async (userId: string, query: Record<string, any>) => {
    const result = await new QueryBuilder(prisma.notification, query)
        .search(['message'])
        .filter()
        .paginate()
        .sort()
        .fields()
        .execute();
    const unreadNotifications = await prisma.notification.count({ where: { recipientId: userId, isRead: false } });
    return {
        result,
        unreadNotifications,
    };
};

const getSingleNotification = async (notificationId: string, userId: string) => {
    return prisma.notification.findUnique({ where: { id: notificationId, recipientId: userId } });
};

const markAllNotificationsAsReadInToDB = async (userId: string) => {
    return prisma.notification.updateMany({ where: { recipientId: userId, isRead: false }, data: { isRead: true } });
};

const markSingleNotificationAsRead = async (notificationId: string, userId: string) => {
    return prisma.notification.update({ where: { id: notificationId, recipientId: userId }, data: { isRead: true } });
};

const deleteSingleNotification = async (notificationId: string, userId: string) => {
    return prisma.notification.delete({ where: { id: notificationId, recipientId: userId } });
};
const deleteAllNotifications = async (userId: string) => {
    return prisma.notification.deleteMany({ where: { recipientId: userId } });
};

export const NotificationService = {
    createNotificationToDB,
    getUserNotifications,
    markAllNotificationsAsReadInToDB,
    markSingleNotificationAsRead,
    deleteAllNotifications,
    deleteSingleNotification,
    getSingleNotification,
};
