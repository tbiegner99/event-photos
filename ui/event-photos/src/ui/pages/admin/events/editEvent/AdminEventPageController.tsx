import React, { useEffect } from 'react';
import { AdminEventPage } from './AdminEventPage';
import { Services } from '../../../../../dependencies';
import { EventData } from '../../../../../models/Event';
import { LoadedItem } from '../../../../../utils/LoadedItem';
import { Navigate, useParams } from 'react-router-dom';
import { RequireRole } from '../../../../components/RequireRole';
import { urls } from '../../../../../utils/constants';

export const AdminEventPageController = () => {
    const { eventId = '' } = useParams();
    const [event, setEvent] = React.useState(LoadedItem.unloaded<EventData>());
    const loadEvent = async () => {
        setEvent(LoadedItem.loading());
        const event = await Services.events.getEventById(eventId);
        setEvent(LoadedItem.loaded(event));
    };
    useEffect(() => {
        loadEvent();
    }, []);
    return (
        <RequireRole
            roles={['system_admin', 'events_admin']}
            permissionDenied={<Navigate to={urls.ADMIN} />}
        >
            <AdminEventPage
                event={event}
                onSave={async (event: EventData) => {
                    await Services.events.addEvent(event);
                }}
            />
        </RequireRole>
    );
};
