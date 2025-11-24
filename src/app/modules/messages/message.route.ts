import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { MessageControllers } from './message.controller';
import auth from '../../middlewares/auth';
import { messageValidation } from './message.validation';

const router = express.Router();

router.post('/send', auth('ANY'), validateRequest.body(messageValidation.sendMessage), MessageControllers.sendMessage);

router.get('/:id', auth('ANY'), MessageControllers.getAllMessageByChatId);
router.patch('/:id', auth('ANY'), MessageControllers.markMessagesAsRead);
router.delete('/:id', auth('ANY'), MessageControllers.deleteMessage);

export const MessageRouters = router;
