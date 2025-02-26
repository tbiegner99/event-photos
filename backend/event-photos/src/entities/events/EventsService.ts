import { EventsDatasource } from './EventsDatasource';
import { EventData } from './models';

export class EventsService {
  constructor(private datasource: EventsDatasource) {}

  async getAllEvents() {
    return this.datasource.getEvents([]);
  }

  async createEvent(event: EventData) {
    return this.datasource.upsertEvent(event);
  }

  async getEventById(eventId: string) {
    return this.datasource.getEventById(eventId);
  }
}
