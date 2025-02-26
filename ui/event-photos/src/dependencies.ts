import { EventsDatasource } from './datasources/events/EventsDatasource';
import { PhotosDatasource } from './datasources/photos/PhotosDatasource';
import { EventsService } from './services/EventsService';

export const Datasources = {
    events: new EventsDatasource(),
    photos: new PhotosDatasource()
};

export const Services = {
    events: new EventsService(Datasources.events, Datasources.photos)
};
