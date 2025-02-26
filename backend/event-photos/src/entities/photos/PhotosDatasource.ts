import { Pool } from 'postgresql-client';
import { BaseDatasource } from '../../datasource/BaseDatasource';

import { PhotosMapper } from './PhotosMapper';
import { Photo, PhotoFilter } from './models';
import { Storage } from '@google-cloud/storage';
import generateThumbnail from 'image-thumbnail';
import { CommonFilter, PageInfo, PageResult } from '../../models/types';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { Readable, Writable } from 'stream';
import { v4 } from 'uuid';

export class PhotosDatsource extends BaseDatasource {
  private mapper: PhotosMapper;
  private storage: Storage;
  constructor(pool: Pool, storage: Storage) {
    super(pool);
    this.mapper = new PhotosMapper();
    this.storage = storage;
  }
  async generatePhotoThumbnail(photoData: Buffer): Promise<Buffer> {
    const res = await generateThumbnail(photoData, {
      width: 200,
      height: 200,
      responseType: 'buffer',
      jpegOptions: { force: true, quality: 100 },
    } as any); //looks like the type definition is out of date to the doc
    return res as Buffer;
  }

  async generateVideoThumbnail(videoData: Buffer): Promise<Buffer> {
    const uuid = v4();
    const tmpFile = `/tmp/${uuid}`;
    const tmpOutput = `/tmp/${uuid}.gif`;
    fs.writeFileSync(tmpFile, videoData);
    try {
      const output = await new Promise<Buffer>((resolve, reject) => {
        try {
          ffmpeg(tmpFile)
            .setStartTime(0)
            .setDuration(5)
            .fps(4)
            .size('200x200')
            .autopad()
            .format('gif')
            .output(tmpOutput)
            .on('end', () => {
              const outputBuffer = fs.readFileSync(tmpOutput);
              resolve(outputBuffer);
            })
            .on('error', (err) => {
              reject(err);
            })
            .run();
        } catch (err) {
          reject(err);
        }
      });
      return output;
    } finally {
      fs.rmSync(tmpFile);
      fs.rmSync(tmpOutput);
    }
  }

  async storePhoto(photo: Photo) {
    if (!photo.photoData) {
      throw new Error('Missing photo data');
    }
    if (!process.env.GOOGLE_BUCKET_NAME) {
      throw new Error('Missing bucket name');
    }
    const photoUrl = `events/${photo.eventId}/${photo.role}/photos/${photo.photoId}`;
    if (photo.contentType.startsWith('image/')) {
      const thumbnailUrl = `events/${photo.eventId}/${photo.role}/thumbnails/${photo.photoId}`;
      const thumbnailData = await this.generatePhotoThumbnail(photo.photoData);
      await this.storage
        .bucket(process.env.GOOGLE_BUCKET_NAME)
        .file(thumbnailUrl)
        .save(thumbnailData, {
          metadata: { contentType: 'image/jpeg' },
        });
    } else {
      const thumbnailUrl = `events/${photo.eventId}/${photo.role}/thumbnails/${photo.photoId}`;
      const thumbnailData = await this.generateVideoThumbnail(photo.photoData);
      await this.storage
        .bucket(process.env.GOOGLE_BUCKET_NAME)
        .file(thumbnailUrl)
        .save(thumbnailData, {
          metadata: { contentType: 'image/gif' },
        });
    }
    await this.storage
      .bucket(process.env.GOOGLE_BUCKET_NAME)
      .file(photoUrl)
      .save(photo.photoData, {
        metadata: { contentType: photo.contentType },
      });
  }

  async upsertPhoto(photo: Photo): Promise<Photo> {
    const query = `
        INSERT INTO event_photos (event_id, photo_id, role, name, size, content_type, author, author_name, created_date, last_modified, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now(), $9)
        ON CONFLICT (photo_id) DO UPDATE
        SET role = $3, 
            name = $4, 
            author = $7,
            author_name = $8, 
             metadata = $9,
            last_modified = NOW()
        RETURNING *;
        `;
    if (photo.photoData) {
      await this.storePhoto(photo);
    }

    const values = [
      photo.eventId,
      photo.photoId,
      photo.role,
      photo.name,
      photo.size,
      photo.contentType,
      photo.author,
      photo.authorName,
      photo.metadata,
    ];
    const results = await this.execQuery(query, values);
    return this.mapper.fromDBRow(results[0]);
  }

  private async loadPhotoDataFromUrl(photoUrl: string): Promise<Buffer> {
    if (!process.env.GOOGLE_BUCKET_NAME) {
      throw new Error('Missing bucket name');
    }

    const response = await this.storage
      .bucket(process.env.GOOGLE_BUCKET_NAME)
      .file(photoUrl)
      .download();
    return response[0];
  }

  async loadPhotoData(options: {
    eventId: string;
    photoId: string;
    role: string;
    isThumbnail: boolean;
  }): Promise<Buffer> {
    const url = `events/${options.eventId}/${options.role}/${
      options.isThumbnail ? 'thumbnails' : 'photos'
    }/${options.photoId}`;
    return await this.loadPhotoDataFromUrl(url);
  }

  async getPhotoById(photoId: string): Promise<Photo> {
    const query = `SELECT * FROM event_photos WHERE photo_id = $1::varchar`;
    const results = await this.execQuery(query, [photoId]);
    return this.mapper.fromDBRow(results[0]);
  }

  async getPhotos(filter: PhotoFilter, pageInfo: PageInfo): Promise<PageResult<Photo>> {
    const whereClause = `WHERE  
    ($1::timestamp IS NULL OR created_date > $1::timestamp) AND 
    ($2::timestamp IS NULL OR created_date <= $2::timestamp) AND
    ($3::varchar IS NULL OR role = $3::varchar) AND
    ($4::varchar IS NULL OR content_type LIKE $4::varchar || '%') AND
    ( event_id = $5::varchar) `;
    const orderClause = `ORDER BY created_date DESC`;
    const countQuery = `SELECT COUNT(*) as count FROM event_photos ${whereClause}`;
    const filterParams = [
      filter.startDate,
      filter.endDate,
      filter.role,
      filter.type,
      filter.eventId,
    ];
    const countResults = await this.execQuery(countQuery, filterParams);
    const totalCount = parseInt(countResults[0].count, 10);
    const query = `SELECT * FROM event_photos ${whereClause} ${orderClause} 
    LIMIT $6 
    OFFSET $7`;
    const results = await this.execQuery(query, [
      ...filterParams,
      pageInfo.pageSize,
      pageInfo.page * pageInfo.pageSize,
    ]);
    const photos = results.map((row) => this.mapper.fromDBRow(row));
    const data = photos.map((photo) => {
      const isImage = photo.contentType.startsWith('image/');
      return {
        ...photo,
        thumbnailUrl: `${process.env.GOOGLE_BUCKET_PUBLIC_URL}/events/${photo.eventId}/${photo.role}/thumbnails/${photo.photoId}`,

        url: `${process.env.GOOGLE_BUCKET_PUBLIC_URL}/events/${photo.eventId}/${photo.role}/photos/${photo.photoId}`,
      };
    });
    return {
      ...pageInfo,
      total: totalCount,
      data,
    };
  }

  async getUniqueTags(eventId: string): Promise<string[]> {
    const query = `select distinct jsonb_array_elements(metadata->'keywords') as tag from event_photos where event_id = $1::varchar`;
    const results = await this.execQuery(query, [eventId]);
    return results.map((row) => row.tag);
  }

  async getUniquePeople(eventId: string): Promise<string[]> {
    const query = `select distinct jsonb_array_elements(metadata->'people') as people from event_photos where event_id = $1::varchar`;
    const results = await this.execQuery(query, [eventId]);
    return results.map((row) => row.people);
  }
}
