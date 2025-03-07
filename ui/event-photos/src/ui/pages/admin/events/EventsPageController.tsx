import React, { useEffect } from 'react';
import { EventsPage } from './EventsPage';
import { Services } from '../../../../dependencies';
import { EventData } from '../../../../models/Event';
import { LoadedItem } from '../../../../utils/LoadedItem';

export const EventsPageController = () => {
    const [events, setEvents] = React.useState(LoadedItem.unloaded<EventData[]>());
    const loadEvents = async () => {
        setEvents(LoadedItem.loading());
        const events = await Services.events.loadEvents();
        setEvents(LoadedItem.loaded(events));
    };
    useEffect(() => {
        loadEvents();
    }, []);
    return (
        <EventsPage
            events={events}
            onSave={async (event: EventData) => {
                await Services.events.addEvent(event);
                loadEvents();
            }}
        />
    );
};
