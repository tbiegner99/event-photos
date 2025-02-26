import { EventData } from '../../models/Event';
import { Photo } from '../../models/Photo';
import BaseDatasource from '../BaseDatasource';
import { EventsMapper } from './EventsMapper';

export class EventsDatasource extends BaseDatasource {
    private mapper: EventsMapper;

    constructor() {
        super();
        this.mapper = new EventsMapper();
    }
    async addEvent(event: EventData) {
        const url = this.constructUrl('/v0/secure/events');
        return this.client.post(url, this.mapper.toAddRequest(event));
    }

    async getEventById(eventId: string): Promise<EventData> {
        const url = this.constructUrl(`/v0/public/events/${eventId}`);
        const event = await this.client.get(url);
        return this.mapper.fromEventRespose(event.data);
    }

    async loadEvents(): Promise<EventData[]> {
        const url = this.constructUrl('/v0/secure/events');
        const events = await this.client.get(url);
        return events.data.map((event: any) => this.mapper.fromEventRespose(event));
    }
}
