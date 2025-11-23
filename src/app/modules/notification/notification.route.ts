import { Router } from 'express';
import auth from '../../middlewares/auth';
import { NotificationController } from './notification.controller';
import { UserRoleEnum } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { notificationValidation } from './notification.validation';

const router = Router();
// CREATE FOR MANUAL NOTIFICATION
router.post(
    '/',
    auth(UserRoleEnum.USER, UserRoleEnum.BUSINESS, UserRoleEnum.SUPERADMIN),
    validateRequest.body(notificationValidation.createNotification),
    NotificationController.createNotification
);
router.get('/', auth('ANY'), NotificationController.getMyNotifications);
router.get('/:id', auth('ANY'), NotificationController.getSingleNotification);
router.patch(
    '/mark-all-as-read',
    auth(UserRoleEnum.USER, UserRoleEnum.BUSINESS, UserRoleEnum.SUPERADMIN),
    NotificationController.markAllNotificationsAsRead
);
router.patch(
    '/mark-single-as-read/:id',
    auth(UserRoleEnum.USER, UserRoleEnum.BUSINESS, UserRoleEnum.SUPERADMIN),
    NotificationController.markSingleNotificationAsRead
);
router.delete(
    '/all',
    auth(UserRoleEnum.USER, UserRoleEnum.BUSINESS, UserRoleEnum.SUPERADMIN),
    NotificationController.deleteAllNotifications
);
router.delete(
    '/:id',
    auth(UserRoleEnum.USER, UserRoleEnum.BUSINESS, UserRoleEnum.SUPERADMIN),
    NotificationController.deleteSingleNotification
);

export const NotificationRouters = router;
