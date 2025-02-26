import { CommonFilter, PageInfo } from 'models/types';
import { Photo, PhotoFilter } from './models';
import { PhotosDatsource } from './PhotosDatasource';

export class PhotosService {
  constructor(private datasource: PhotosDatsource) {}

  async addPhoto(photo: Photo) {
    return this.datasource.upsertPhoto(photo);
  }
  async getAllPhotos(filter: PhotoFilter, pageInfo: PageInfo) {
    return this.datasource.getPhotos(filter, pageInfo);
  }

  async getUniqueTags(eventId: string) {
    return this.datasource.getUniqueTags(eventId);
  }

  async getUniquePeople(eventId: string) {
    return this.datasource.getUniquePeople(eventId);
  }

  async loadPhoto(
    photoId: string,
    options: {
      loadThumbnail: boolean;
    } = { loadThumbnail: true }
  ) {
    const metadata = await this.datasource.getPhotoById(photoId);

    let photoData = await this.datasource.loadPhotoData({
      eventId: metadata.eventId,
      photoId: metadata.photoId,
      role: metadata.role,
      isThumbnail: options.loadThumbnail,
    });

    return { ...metadata, photoData };
  }
}
