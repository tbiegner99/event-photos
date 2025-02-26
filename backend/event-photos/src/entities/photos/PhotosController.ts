import { HTTPStatus } from '../../utils/constants';
import { PhotosService } from './PhotosService';
import { Response, NextFunction } from 'express';
import { SessionRequest } from 'supertokens-node/framework/express';

import { PhotosMapper } from './PhotosMapper';
import supertokens from 'supertokens-node';
import UserMetadata from 'supertokens-node/recipe/usermetadata';
import { CommonFilter, PageInfo } from 'models/types';
import dayjs from 'dayjs';
import { PhotoFilter } from './models';

export class PhotosController {
  constructor(private eventsService: PhotosService) {}

  async getUniqueTags(req: SessionRequest, res: Response, next: NextFunction) {
    const { eventId } = req.params;
    const tags = await this.eventsService.getUniqueTags(eventId);
    res.status(HTTPStatus.OK).send(tags);
  }
  async getUniquePeople(req: SessionRequest, res: Response, next: NextFunction) {
    const { eventId } = req.params;
    const people = await this.eventsService.getUniquePeople(eventId);
    res.status(HTTPStatus.OK).send(people);
  }

  async deletePhoto(req: SessionRequest, res: Response, next: NextFunction) {}
  async searchPhotos(req: SessionRequest, res: Response, next: NextFunction) {
    const { page: qPage, limit, type, endDate, startDate } = req.query;
    const { eventId } = req.params;
    const filter: PhotoFilter = {
      endDate: Boolean(endDate) ? dayjs(endDate as string).toISOString() : undefined,
      startDate: Boolean(startDate) ? dayjs(startDate as string).toISOString() : undefined,
      eventId,
      type: type as 'image' | 'video',
      role: 'event',
    };
    const pageSize = parseInt((limit as string) || '50', 10);
    const page = parseInt((qPage as string) || '0', 10);
    const pageInfo: PageInfo = {
      pageSize: Number.isNaN(pageSize) ? 50 : pageSize,
      page: Number.isNaN(page) ? 0 : page,
    };
    const result = await this.eventsService.getAllPhotos(filter, pageInfo);
    res.status(HTTPStatus.OK).send(result);
  }

  async loadPhoto(req: SessionRequest, res: Response, next: NextFunction) {
    const photoId = req.params.photoId;
    const photo = await this.eventsService.loadPhoto(photoId, {
      loadThumbnail: false,
    });

    res.set('Content-Type', photo.contentType).status(HTTPStatus.OK).send(photo.photoData);
  }
  async loadThumbnail(req: SessionRequest, res: Response, next: NextFunction) {
    const photoId = req.params.photoId;
    const photo = await this.eventsService.loadPhoto(photoId, {
      loadThumbnail: true,
    });

    res.set('Content-Type', photo.contentType).status(HTTPStatus.OK).send(photo.photoData);
  }
  async addPhoto(req: SessionRequest, res: Response, next: NextFunction) {
    const mapper = new PhotosMapper();

    const userId = req.session?.getUserId();
    let photo = mapper.fromRequestBody(req);
    if (!photo.author && userId) {
      let userInfo = await UserMetadata.getUserMetadata(userId);
      photo = {
        ...photo,
        author: userId,
        authorName: `${userInfo?.metadata.first_name || ''} ${userInfo?.metadata.last_name || ''}`,
      };
    }
    await this.eventsService.addPhoto(photo);
    res.sendStatus(HTTPStatus.CREATED);
  }
  async batchAddPhoto(req: SessionRequest, res: Response, next: NextFunction) {}
  async updatePhoto(req: SessionRequest, res: Response, next: NextFunction) {}
}
