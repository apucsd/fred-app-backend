import { Router } from 'express';
import { FaqController } from './faq.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { faqValidation } from './faq.validation';

const router = Router();

router.post(
    '/',
    auth(UserRoleEnum.SUPERADMIN),
    validateRequest.body(faqValidation.createFaqValidationSchema),
    FaqController.createFaq
);
router.get('/', FaqController.getAllFaqs);
router.get('/:id', FaqController.getFaqById);
router.patch('/:id', auth(UserRoleEnum.SUPERADMIN), FaqController.updateFaq);
router.delete('/:id', auth(UserRoleEnum.SUPERADMIN), FaqController.deleteFaq);

export const FaqRouters = router;
