import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ChatControllers } from './chat.controller';
import auth from '../../middlewares/auth';
import { ChatValidation } from './chat.validation';

const router = express.Router();

router.post('/', auth('ANY'), validateRequest.body(ChatValidation.createChat), ChatControllers.createChat);
router.get('/', auth('ANY'), ChatControllers.getMyChats);
router.get('/:id', auth('ANY'), ChatControllers.getChatById);

export const ChatRoutes = router;
