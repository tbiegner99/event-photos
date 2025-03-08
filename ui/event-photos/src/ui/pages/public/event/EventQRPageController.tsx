import React from 'react';
import { useParams } from 'react-router-dom';
import { LoadedItem } from '../../../../utils/LoadedItem';
import { EventData } from '../../../../models/Event';
import { Services } from '../../../../dependencies';
import { EventPage } from './EventPage';

import { Photo } from '../../../../models/Photo';
import { EventQRPage } from './EventQRPage';
import { CircularProgress } from '@mui/material';

export const EventQRPageController = () => {
    const { eventId = '' } = useParams();
    const [event, setEvent] = React.useState<LoadedItem<EventData>>(LoadedItem.unloaded());
    const loadEvent = async () => {
        setEvent(LoadedItem.loading());
        const event = await Services.events.getEventById(eventId || '');
        document.title = event.name;
        setEvent(LoadedItem.loaded(event));
    };

    React.useEffect(() => {
        loadEvent();
    }, []);

    if (!event.isLoaded()) {
        return <CircularProgress size={100} />;
    }
    return <EventQRPage event={event.item!} qrSize={event.item?.config?.qrSize || 400} />;
};
