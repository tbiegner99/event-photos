import React from 'react';
import { useParams } from 'react-router-dom';
import { LoadedItem } from '../../../../utils/LoadedItem';
import { EventData } from '../../../../models/Event';
import { Services } from '../../../../dependencies';
import { EventPage } from './EventPage';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import { Photo } from '../../../../models/Photo';

export const EventPageController = () => {
    const { eventId = '' } = useParams();
    const [event, setEvent] = React.useState<LoadedItem<EventData>>(LoadedItem.unloaded());
    const loadEvent = async () => {
        setEvent(LoadedItem.loading());
        const event = await Services.events.getEventById(eventId || '');
        setEvent(LoadedItem.loaded(event));
    };

    React.useEffect(() => {
        loadEvent();
    }, []);

    const onUpload = async (photo: Photo) => {
        await Services.events.uploadPhoto(photo);
    };

    return <EventPage eventId={eventId} event={event} onUpload={onUpload} />;
};
