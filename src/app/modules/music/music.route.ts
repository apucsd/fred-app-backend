import { Router } from 'express';
import { MusicController } from './music.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { MusicValidation } from './music.validation';
import { upload } from '../../middlewares/upload';
import { parseBody } from '../../middlewares/parseBody';

const router = Router();

router.post(
    '/',
    auth(UserRoleEnum.BUSINESS),
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'audio', maxCount: 1 },
    ]),
    parseBody,
    validateRequest.body(MusicValidation.createMusicSchema),
    MusicController.createMusic
);

router.get('/', auth('ANY'), MusicController.getAllMusic);
router.get('/:id', auth('ANY'), MusicController.getMusicById);
router.patch(
    '/:id',
    auth(UserRoleEnum.BUSINESS),
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'audio', maxCount: 1 },
    ]),
    parseBody,
    MusicController.updateMusic
);
router.delete('/:id', auth(UserRoleEnum.BUSINESS), MusicController.deleteMusic);

export const MusicRouters = router;
