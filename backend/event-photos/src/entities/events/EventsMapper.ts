import dayjs from 'dayjs';
import { EventData } from './models';
import { Request } from 'express';
import Joi from 'joi';

export class EventsMapper {
  fromRequestBody(req: Request): EventData {
    var body = req.body;
    const schema = {
      eventId: Joi.string().required(),
      name: Joi.string().required(),
      description: Joi.string().optional().allow(null, ''),
      heroImageId: Joi.string().required(),
      eventDate: Joi.date().iso().required(),
      location: Joi.string().required(),
    };
    const { error, value: validated } = Joi.object(schema).unknown(true).validate(body);
    if (error) {
      throw error;
    }
    return {
      eventId: validated.eventId,
      name: validated.name,
      description: validated.description,
      heroImageId: validated.heroImageId,
      eventDate: validated.eventDate,
      location: validated.location,
      lastModified: dayjs().toISOString(),
      createdDate: dayjs().toISOString(),
    };
  }
  fromDBRow(row: any): EventData {
    return {
      eventId: row.event_id,
      name: row.name,
      description: row.description,
      heroImageId: row.hero_image_id,

      eventDate: dayjs(row.event_date).toISOString(),
      location: row.location,
      lastModified: dayjs(row.last_modified).toISOString(),
      createdDate: dayjs(row.created).toISOString(),
    };
  }
}
