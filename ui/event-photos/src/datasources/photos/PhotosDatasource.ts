import { PageInfo, PageResult } from '../../models/Pagination';
import { Photo, PhotoFilters } from '../../models/Photo';
import BaseDatasource from '../BaseDatasource';
import { PhotosMapper } from './PhotosMapper';

export class PhotosDatasource extends BaseDatasource {
    private mapper: PhotosMapper;
    constructor() {
        super();
        this.mapper = new PhotosMapper();
    }
    async addPhoto(photo: Photo) {
        const url = this.constructUrl(`/v0/public/events/${photo.eventId}/photos`);
        return this.client.post(url, this.mapper.toAddRequest(photo));
    }
    async getUniquePeople(eventId: string) {
        const url = this.constructUrl(`/v0/public/events/${eventId}/photos/people`);
        const people = await this.client.get(url);
        return people.data;
    }
    async getUniqueTags(eventId: string) {
        const url = this.constructUrl(`/v0/public/events/${eventId}/photos/tags`);
        const tags = await this.client.get(url);
        return tags.data;
    }

    async getPhotos(filters: PhotoFilters, pageInfo: PageInfo): Promise<PageResult<Photo>> {
        const queryParams = new URLSearchParams();
        queryParams.append('page', pageInfo.page.toString());
        queryParams.append('limit', pageInfo.pageSize.toString());
        if (filters.endDate) {
            queryParams.append('endDate', filters.endDate.toISOString());
        }
        if (filters.startDate) {
            queryParams.append('startDate', filters.startDate.toISOString());
        }
        const url = this.constructUrl(
            `/v0/public/events/${filters.eventId}/photos?${queryParams.toString()}`
        );
        const photos = await this.client.get(url);
        return this.mapper.fromPhotoResponse(photos.data);
    }
}
