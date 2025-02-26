import dayjs from 'dayjs';
import { Request } from 'express';
import { Photo } from './models';
import Joi from 'joi';

export class PhotosMapper {
  fromRequestBody(req: Request): Photo {
    var body = req.body;
    const schema = {
      eventId: Joi.string().required(),
      photoId: Joi.string().required(),
      role: Joi.string().required(),
      author: Joi.string().optional().allow(null, ''),
      authorName: Joi.string().optional().allow(null, ''),
      created: Joi.date().iso().required(),
      metadata: Joi.string().required(),
      name: Joi.string().optional().allow(null, ''),
      size: Joi.number().optional().allow(null),
    };
    const { error, value: validated } = Joi.object(schema).unknown(true).validate(body);
    if (error) {
      throw error;
    }
    return {
      ...validated,
      size: req.file?.size || Number.parseInt(validated.size),
      photoData: req.file?.buffer,
      name: req.file?.originalname || validated.name,
      contentType: req.file?.mimetype || validated.contentType,
      metadata: JSON.parse(validated.metadata),
      lastModified: dayjs().toISOString(),
    };
  }
  toDBRow(photo: Photo): any {
    return {
      event_id: photo.eventId,
      photo_id: photo.photoId,
      role: photo.role,
      url: photo.url,
      name: photo.name,
      size: photo.size,
      content_type: photo.contentType,
      author: photo.author,
      author_name: photo.authorName,
      created_date: photo.created,
      last_modified: photo.lastModified,
      metadata: photo.metadata,
    };
  }
  fromDBRow(row: any): Photo {
    return {
      photoId: row.photo_id,
      eventId: row.event_id,
      role: row.role,
      name: row.name,
      size: row.size,
      contentType: row.content_type,
      author: row.author,
      authorName: row.author_name,
      created: dayjs(row.created_date).toISOString(),
      lastModified: dayjs(row.last_modified).toISOString(),
      metadata: row.metadata || {},
    };
  }
}
