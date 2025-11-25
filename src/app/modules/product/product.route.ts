import { Router } from 'express';
import { ProductController } from './product.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';

const router = Router();

router.post('/', auth(UserRoleEnum.BUSINESS), ProductController.createProduct);
router.patch('/:id', auth(UserRoleEnum.BUSINESS), ProductController.updateProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getSingleProduct);
router.delete('/:id', auth(UserRoleEnum.BUSINESS), ProductController.deleteProduct);

export const ProductRouters = router;
