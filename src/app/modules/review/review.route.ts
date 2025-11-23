import express from 'express';
import auth from '../../middlewares/auth';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import validateRequest from '../../middlewares/validateRequest';
import { UserRoleEnum } from '@prisma/client';

const router = express.Router();

router.post(
    '/',
    auth(UserRoleEnum.USER),
    validateRequest.body(ReviewValidation.createReviewZodSchema),
    ReviewController.createReview
);

router.get('/', auth(UserRoleEnum.USER), ReviewController.getReviews);

router.get('/:id', auth(UserRoleEnum.USER), ReviewController.getSingleReview);

router.patch(
    '/:id',
    auth(UserRoleEnum.USER),
    validateRequest.body(ReviewValidation.updateReviewZodSchema),
    ReviewController.updateReview
);

router.delete('/:id', auth(UserRoleEnum.USER), ReviewController.deleteReview);

export const ReviewRouters = router;
