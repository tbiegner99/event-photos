import dayjs from 'dayjs';
import { EventData } from '../../models/Event';

export class EventsMapper {
    toAddRequest(event: EventData): any {
        return {
            eventId: event.eventId,
            name: event.name,
            description: event.description,
            heroImageId: event.heroImage?.photoId || event.heroImageId,
            eventDate: event.eventDate.toISOString(),
            config: event.config,
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
            config: response.config,
            createdDate: dayjs(response.createdDate).toDate(),
            lastModified: dayjs(response.lastModified).toDate()
        };
    }
}
