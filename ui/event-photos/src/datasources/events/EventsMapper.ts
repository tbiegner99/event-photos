import dayjs from 'dayjs';
import { EventData } from '../../models/Event';

export class EventsMapper {
    toAddRequest(event: EventData): any {
        return {
            eventId: event.eventId,
            name: event.name,
            description: event.description,
            heroImageId: event.heroImage!.photoId,
            eventDate: event.eventDate.toISOString(),
            location: event.location,
            createdDate: event.createdDate.toISOString()
        };
    }

    fromEventRespose(response: any): EventData {
        return {
            eventId: response.eventId,
            name: response.name,
            description: response.description,
            heroImageId: response.heroImageId,
            eventDate: dayjs(response.eventDate).toDate(),
            location: response.location,
            createdDate: dayjs(response.createdDate).toDate(),
            lastModified: dayjs(response.lastModified).toDate()
        };
    }
}
