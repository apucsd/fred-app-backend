import { Router } from 'express';
import { ProductController } from './product.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import { upload } from '../../middlewares/upload';
import { parseBody } from '../../middlewares/parseBody';

const router = Router();

router.post('/', upload.array('image', 3), parseBody, auth(UserRoleEnum.BUSINESS), ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getSingleProduct);
router.delete('/:id', auth(UserRoleEnum.BUSINESS), ProductController.deleteProduct);

export const ProductRouters = router;
