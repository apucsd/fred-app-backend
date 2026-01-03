import { Router } from 'express';
import { ProductController } from './product.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { ProductValidation } from './product.validation';

const router = Router();

router.post(
    '/',
    auth(UserRoleEnum.BUSINESS),
    validateRequest.body(ProductValidation.createProductValidation),
    ProductController.createProduct
);
router.patch(
    '/:id',
    auth(UserRoleEnum.BUSINESS, UserRoleEnum.SUPERADMIN),
    validateRequest.body(ProductValidation.updateProductValidation),
    ProductController.updateProduct
);
router.get('/my-products', auth(UserRoleEnum.BUSINESS), ProductController.getMyProducts);
router.patch('/approve/:id', auth(UserRoleEnum.SUPERADMIN), ProductController.approveProduct);

router.get('/', auth('ANY'), ProductController.getAllProducts);
router.get('/user/:id', auth('ANY'), ProductController.getSpecificUserProducts);
router.get('/:id', auth('ANY'), ProductController.getSingleProduct);
router.delete('/:id', auth(UserRoleEnum.BUSINESS, UserRoleEnum.SUPERADMIN), ProductController.deleteProduct);

export const ProductRouters = router;
