import { Router } from 'express';
import { EventController } from './event.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { EventValidation } from './event.validation';
import { upload } from '../../middlewares/upload';
import { parseBody } from '../../middlewares/parseBody';

const router = Router();

router.post(
    '/',
    auth(UserRoleEnum.BUSINESS),
    upload.single('image'),
    parseBody,
    validateRequest.body(EventValidation.createEventSchema),
    EventController.createEvent
);
router.get('/', auth('ANY'), EventController.getAllEvents);
router.get('/:id', auth('ANY'), EventController.getEventById);
router.patch('/:id', auth(UserRoleEnum.BUSINESS), upload.single('image'), parseBody, EventController.updateEvent);
router.delete('/:id', auth(UserRoleEnum.BUSINESS), EventController.deleteEvent);

export const EventRouters = router;
