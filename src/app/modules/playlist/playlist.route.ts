import { Router } from 'express';
import { PlaylistController } from './playlist.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { PlaylistValidation } from './playlist.validation';

const router = Router();

router.post(
    '/',
    auth(UserRoleEnum.BUSINESS),
    validateRequest.body(PlaylistValidation.createPlaylistZodSchema),
    PlaylistController.createPlaylist
);
router.get('/', auth('ANY'), PlaylistController.getAllPlaylists);
router.get('/my-playlists/:userId', auth(UserRoleEnum.BUSINESS), PlaylistController.getPlaylistByUserId);
router.get('/:id', auth('ANY'), PlaylistController.getPlaylistById);
router.patch(
    '/:id',
    auth(UserRoleEnum.BUSINESS),
    validateRequest.body(PlaylistValidation.updatePlaylistZodSchema),
    PlaylistController.updatePlaylist
);
router.delete('/:id', auth(UserRoleEnum.BUSINESS), PlaylistController.deletePlaylist);

export const playlistRouters = router;
