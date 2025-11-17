import { Router } from 'express';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { SupportTicketValidation } from './support-ticket.validation';
import { SupportTicketController } from './support-ticket.controller';

const router = Router();

router.post(
    '/',
    auth(UserRoleEnum.USER),
    validateRequest.body(SupportTicketValidation.createSupportTicketSchema),
    SupportTicketController.createSupportTicket
);

router.get('/', auth(UserRoleEnum.SUPERADMIN), SupportTicketController.getSupportTicketsForAdmin);
router.get('/my-tickets', auth(UserRoleEnum.USER), SupportTicketController.getMySupportTickets);

// router.get('/:id', auth(UserRoleEnum.SUPERADMIN), SupportTicketController.getSupportTicket);

router.patch(
    '/:id',
    auth(UserRoleEnum.SUPERADMIN),
    validateRequest.body(SupportTicketValidation.updateSupportTicketSchema),
    SupportTicketController.updateSupportTicket
);

router.delete('/:id', auth(UserRoleEnum.USER), SupportTicketController.deleteSupportTicket);

export const SupportTicketRouters = router;
