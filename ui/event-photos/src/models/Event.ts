import { Dayjs } from 'dayjs';
import { Photo } from './Photo';

export interface EventData {
    eventId: string;
    name: string;
    description: string;
    heroImageId?: string;
    heroImage?: Photo;
    eventDate: Date;
    location: string;
    createdDate: Date;

    lastModified?: Date;
}
