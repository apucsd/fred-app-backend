import { Router } from 'express';
import { CategoryController } from './category.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidation } from './category.validation';

const router = Router();

router.post(
    '/',
    auth(UserRoleEnum.SUPERADMIN),
    validateRequest.body(CategoryValidation.createCategoryValidationSchema),
    CategoryController.createCategory
);
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.patch('/:id', auth(UserRoleEnum.SUPERADMIN), CategoryController.updateCategory);
router.delete('/:id', auth(UserRoleEnum.SUPERADMIN), CategoryController.deleteCategory);

export const CategoryRouters = router;
