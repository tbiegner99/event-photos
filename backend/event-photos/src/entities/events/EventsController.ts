import { HTTPStatus, Roles } from '../../utils/constants';
import { EventsService } from './EventsService';
import { Request, Response, NextFunction } from 'express';
import { SessionRequest } from 'supertokens-node/framework/express';
import UserRoles from 'supertokens-node/recipe/userroles';
import { EventsMapper } from './EventsMapper';
export class EventsController {
  private mapper: EventsMapper;
  constructor(private eventsService: EventsService) {
    this.mapper = new EventsMapper();
  }

  async createEvent(req: SessionRequest, res: Response, next: NextFunction) {
    try {
      const evt = this.mapper.fromRequestBody(req);
      const event = await this.eventsService.createEvent(evt);
      res.status(HTTPStatus.CREATED).json(event);
    } catch (e) {
      next(e);
    }
  }

  async getEventById(req: SessionRequest, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.eventId;
      const event = await this.eventsService.getEventById(eventId);
      res.status(HTTPStatus.OK).json(event);
    } catch (e) {
      next(e);
    }
  }

  async getAllEvents(req: SessionRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await req.session!.getClaimValue(UserRoles.UserRoleClaim);
      let allowedEvents = [];
      if (roles?.includes(Roles.SYSTEM_ADMIN) || roles?.includes(Roles.EVENTS_ADMIN)) {
        allowedEvents = [];
      } else {
        allowedEvents =
          roles
            ?.filter((role) => role.match(Roles.EVENT_MANAGER))
            .map((role) => role.split(':')[1]) || [];
        if (allowedEvents.length === 0) {
          res
            .status(HTTPStatus.FORBIDDEN)
            .json({ code: 'forbidden', message: 'You do not have permission to view events' });
          return;
        }
      }

      const events = await this.eventsService.getAllEvents();
      res.json(events).status(HTTPStatus.OK).send();
    } catch (e) {
      next(e);
    }
  }
}
