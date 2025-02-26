import { Pool } from 'postgresql-client';
import { BaseDatasource } from '../../datasource/BaseDatasource';

import { EventsMapper } from './EventsMapper';
import { EventData } from './models';

export class EventsDatasource extends BaseDatasource {
  private mapper: EventsMapper;
  constructor(pool: Pool) {
    super(pool);
    this.mapper = new EventsMapper();
  }

  async upsertEvent(event: EventData): Promise<EventData> {
    const query = `
        INSERT INTO events (event_id, name, description, hero_image_id, event_date, location,created_date, last_modified)
        VALUES ($1, $2, $3, $4, $5, $6, now(), now())
        ON CONFLICT (event_id) DO UPDATE
        SET name = $2,
            description = $3,
            hero_image_id = $4,
            event_date = $5,
            location = $6,
            last_modified = NOW()
        RETURNING *;
        `;
    const values = [
      event.eventId,
      event.name,
      event.description,
      event.heroImageId,
      event.eventDate,
      event.location,
    ];
    const results = await this.execQuery(query, values);
    return this.mapper.fromDBRow(results[0]);
  }

  async getEventById(eventId: string): Promise<EventData | null> {
    const query = `SELECT * FROM events WHERE event_id = $1::varchar`;
    const values = [eventId];
    const results = await this.execQuery(query, values);
    if (results.length === 0) {
      return null;
    }
    return this.mapper.fromDBRow(results[0]);
  }

  async getEvents(eventIds: string[]): Promise<EventData[]> {
    const clauses = eventIds.map((e, index) => `event_id = $${index + 1}`).join(' OR ');
    const whereClauses = eventIds.length > 0 ? `WHERE ${clauses}` : '';
    const query = `SELECT * FROM events ${whereClauses}`;
    const results = await this.execQuery(query, eventIds);
    return results.map((r) => this.mapper.fromDBRow(r));
  }
}
