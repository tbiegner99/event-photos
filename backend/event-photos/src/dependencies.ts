import { PhotosDatsource } from './entities/photos/PhotosDatasource';
import { EventsController, EventsService, EventsDatasource } from './entities/events';
import { Pool } from 'postgresql-client';
import { PhotosController } from './entities/photos';
import { PhotosService } from './entities/photos/PhotosService';
import { Storage } from '@google-cloud/storage';

const pool = new Pool({
  host: process.env.DATABASE_URL,
  port: Number.parseInt(process.env.DATABASE_PORT || ''),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_SCHEMA,

  min: 1,
  max: 10,
  idleTimeoutMillis: 15000,
});
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export const datasources = {
  events: new EventsDatasource(pool),
  photos: new PhotosDatsource(pool, storage),
};

export const services = {
  events: new EventsService(datasources.events),
  photos: new PhotosService(datasources.photos),
};

export const controllers = {
  events: new EventsController(services.events),
  photos: new PhotosController(services.photos),
};
