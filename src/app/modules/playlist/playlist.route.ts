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
router.get('/my-playlists', auth(UserRoleEnum.BUSINESS), PlaylistController.getMyPlaylists);
router.get('/my-playlists/:id', auth(UserRoleEnum.BUSINESS), PlaylistController.getMyPlaylistById);
router.get('/payment-details/:sessionId', auth('ANY'), PlaylistController.getPaymentDetails);
router.get('/:id', auth('ANY'), PlaylistController.getPlaylistById);
router.patch(
    '/:id',
    auth(UserRoleEnum.BUSINESS),
    validateRequest.body(PlaylistValidation.updatePlaylistZodSchema),
    PlaylistController.updatePlaylist
);
router.delete('/:id', auth(UserRoleEnum.BUSINESS), PlaylistController.deletePlaylist);

export const playlistRouters = router;
