import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { WishlistController } from './wishlist.controller';
import { WishlistValidation } from './wishlist.validation';
import { UserRoleEnum } from '@prisma/client';

const router = Router();

router.post(
    '/',
    auth(UserRoleEnum.USER),
    validateRequest.body(WishlistValidation.createWishlistValidation),
    WishlistController.addToWishlist
);

router.get('/', auth(UserRoleEnum.USER), WishlistController.getMyWishlist);

export const WishlistRouters = router;
