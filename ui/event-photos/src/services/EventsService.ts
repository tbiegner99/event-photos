import { EventsDatasource } from '../datasources/events/EventsDatasource';
import { PhotosDatasource } from '../datasources/photos/PhotosDatasource';
import { EventData } from '../models/Event';
import { PageInfo } from '../models/Pagination';
import { Photo, PhotoFilters } from '../models/Photo';

export class EventsService {
    constructor(
        private eventsDatasource: EventsDatasource,
        private photosDatasource: PhotosDatasource
    ) {}

    async getEventById(eventId: string) {
        return this.eventsDatasource.getEventById(eventId);
    }

    async getUniquePeople(eventId: string) {
        return this.photosDatasource.getUniquePeople(eventId);
    }

    async getUniqueTags(eventId: string) {
        return this.photosDatasource.getUniqueTags(eventId);
    }

    async addEvent(event: EventData) {
        if (!event.heroImage) {
            throw new Error('Hero image is required');
        }
        await this.photosDatasource.addPhoto(event.heroImage!);
        await this.eventsDatasource.addEvent(event);
    }

    async loadEvents() {
        return this.eventsDatasource.loadEvents();
    }

    async loadEventPhotos(eventId: string, pageInfo: PageInfo, filters: PhotoFilters) {
        return this.photosDatasource.getPhotos({ ...filters, eventId }, pageInfo);
    }

    async uploadPhoto(photo: Photo) {
        await this.photosDatasource.addPhoto(photo);
    }
    async updatePhoto(photo: Photo) {
        await this.photosDatasource.addPhoto(photo);
    }
}
