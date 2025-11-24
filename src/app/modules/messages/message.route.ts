import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { MessageControllers } from './message.controller';
import auth from '../../middlewares/auth';
import { messageValidation } from './message.validation';

const router = express.Router();

router.post('/send', auth('ANY'), validateRequest.body(messageValidation.sendMessage), MessageControllers.sendMessage);

router.get('/conversation/:id', auth('ANY'), MessageControllers.getConversation);
router.get('/conversation-list', auth('ANY'), MessageControllers.getAllConversationUsers);
router.patch('/mark-read/:messageId', auth('ANY'), MessageControllers.markMessageAsRead);
router.delete('/delete/:messageId', auth('ANY'), MessageControllers.deleteMessage);

export const MessageRouters = router;
