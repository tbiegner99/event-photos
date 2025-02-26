import express, { Request, Response } from 'express';
import { controllers } from './dependencies';
import { HTTPStatus } from './utils/constants';
import { errorHandler, middleware } from 'supertokens-node/framework/express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { eventsRouter, publicEventsRouter } from './entities/events/router';
import bodyParser from 'body-parser';
import { photosPublicRouter, photosSecureRouter } from './entities/photos/router';

export const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
const v0Router = express.Router();
router.use('/v0', v0Router);
const secureRouter = express.Router();

secureRouter.use(verifySession());
secureRouter.get('/health', (_req: Request, res: Response) => {
  res.status(HTTPStatus.OK).send({ status: 'Healthy' });
});
secureRouter.use(eventsRouter);
secureRouter.use(photosSecureRouter);
secureRouter.use(errorHandler());

const publicRouter = express.Router();

publicRouter.get('/health', (_req: Request, res: Response) => {
  res.status(HTTPStatus.OK).send({ status: 'Healthy' });
});

publicRouter.use(photosPublicRouter);
publicRouter.use(publicEventsRouter);
v0Router.use('/secure', secureRouter);
v0Router.use('/public', publicRouter);
