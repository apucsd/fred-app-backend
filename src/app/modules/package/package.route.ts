import { Router } from 'express';
import { packageControllers } from './package.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { packageValidation } from './package.validation';

const router = Router();

router.post(
    '/',
    auth('SUPERADMIN'),
    validateRequest.body(packageValidation.packageValidationSchema),
    packageControllers.createPackage
);
router.get('/all', auth('SUPERADMIN'), packageControllers.getAllPackagesForAdmin);
router.get('/:id', auth('ANY'), packageControllers.getPackageById);
router.get('/', auth('BUSINESS', 'USER'), packageControllers.getAllPackages);
router.patch(
    '/:id',
    auth('SUPERADMIN'),
    validateRequest.body(packageValidation.updatePackageValidationSchema),
    packageControllers.updatePackage
);
router.delete('/:id', auth('SUPERADMIN'), packageControllers.deletePackage);

export const packageRouters = router;
