import express from 'express';
import { controllers } from '../../dependencies';
import { requireRoles } from '../../middleware/RequireRoles';
import { Roles } from '../../utils/constants';
import multer from 'multer';

const upload = multer();
const secureRouter = express.Router();
secureRouter.delete(
  '/event/:eventId/photos/:photoId',
  requireRoles([Roles.SYSTEM_ADMIN, Roles.EVENTS_ADMIN, Roles.EVENT_MANAGER]),
  controllers.photos.deletePhoto.bind(controllers.photos)
);

const publicRouter = express.Router();

publicRouter.get(
  '/events/:eventId/photos',
  controllers.photos.searchPhotos.bind(controllers.photos)
);
publicRouter.get(
  '/events/:eventId/photos/tags',
  controllers.photos.getUniqueTags.bind(controllers.photos)
);
publicRouter.get(
  '/events/:eventId/photos/people',
  controllers.photos.getUniquePeople.bind(controllers.photos)
);
//publicRouter.get('/event/:eventId/photos/:photoId', controllers.photos.getPhotoBytId.bind(controllers.photos));
publicRouter.get(
  '/events/:eventId/photos/:photoId/thumb',
  controllers.photos.loadThumbnail.bind(controllers.photos)
);
publicRouter.get(
  '/events/:eventId/photos/:photoId/full',
  controllers.photos.loadPhoto.bind(controllers.photos)
);
publicRouter.post(
  '/events/:eventId/photos',
  upload.single('photo'),
  controllers.photos.addPhoto.bind(controllers.photos)
);
publicRouter.post(
  '/events/:eventId/photos/batch',
  upload.array('photos'),
  controllers.photos.batchAddPhoto.bind(controllers.photos)
);
publicRouter.put(
  '/events/:eventId/photos/:photoId',
  controllers.photos.updatePhoto.bind(controllers.photos)
);

export const photosPublicRouter = publicRouter;
export const photosSecureRouter = secureRouter;
