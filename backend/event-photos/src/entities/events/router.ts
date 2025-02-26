import express from 'express';
import { controllers } from '../../dependencies';
import { requireRoles } from '../../middleware/RequireRoles';
import { Roles } from '../../utils/constants';

const publicRouter = express.Router();
publicRouter.get('/events/:eventId', controllers.events.getEventById.bind(controllers.events));

const router = express.Router();
router.get(
  '/events',
  requireRoles([Roles.SYSTEM_ADMIN, Roles.EVENTS_ADMIN, Roles.EVENT_MANAGER]),
  controllers.events.getAllEvents.bind(controllers.events)
);
router.post(
  '/events',
  requireRoles([Roles.SYSTEM_ADMIN, Roles.EVENTS_ADMIN, Roles.EVENT_MANAGER]),
  controllers.events.createEvent.bind(controllers.events)
);

export const eventsRouter = router;
export const publicEventsRouter = publicRouter;
