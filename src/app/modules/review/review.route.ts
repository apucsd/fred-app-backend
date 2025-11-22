import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.createReview
);

router.get(
  '/',
  ReviewController.getReviews
);

router.get(
  '/:id',
  ReviewController.getSingleReview
);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  validateRequest(ReviewValidation.updateReviewZodSchema),
  ReviewController.updateReview
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  ReviewController.deleteReview
);

export const ReviewRoutes = router;
