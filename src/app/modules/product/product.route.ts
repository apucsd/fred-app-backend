import { Router } from 'express';
import { ProductController } from './product.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';

const router = Router();

router.post('/', auth(UserRoleEnum.BUSINESS), ProductController.createProduct);
router.patch('/:id', auth(UserRoleEnum.BUSINESS, UserRoleEnum.SUPERADMIN), ProductController.updateProduct);
router.get('/', auth('ANY'), ProductController.getAllProducts);
router.get('/user/:id', auth('ANY'), ProductController.getSpecificUserProducts);
router.get('/:id', auth('ANY'), ProductController.getSingleProduct);
router.delete('/:id', auth(UserRoleEnum.BUSINESS, UserRoleEnum.SUPERADMIN), ProductController.deleteProduct);

export const ProductRouters = router;
