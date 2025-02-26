import React, { useEffect } from 'react';
import { FlexColumn, FlexRow } from '../../../../components/containers/Flex';
import { Button, CircularProgress, Drawer, TextField } from '@mui/material';
import { RequireRole } from '../../../../components/RequireRole';
import styles from '../events.module.css';
import { EventData } from '../../../../../models/Event';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import { LoadedItem } from '../../../../../utils/LoadedItem';
import { H4 } from '../../../../components/typography/Typography';

export const AdminEventPage = ({
    onSave,
    event
}: {
    onSave: (data: EventData) => Promise<any>;
    event: LoadedItem<EventData>;
}) => {
    const [isAdding, setIsAdding] = React.useState(false);
    const [adding, setAdding] = React.useState<Partial<EventData>>({});
    const [editEvent, setEditEvent] = React.useState<EventData | null>(null);
    const canSave = () => {
        return (
            adding && Boolean(adding.name) && Boolean(adding.location) && Boolean(adding.heroImage)
        );
    };
    useEffect(() => {
        if (event.isLoaded()) {
            setEditEvent(event.item);
        }
    }, [event]);
    if (!event.isLoaded()) {
        return <CircularProgress size={50} />;
    }
    return (
        <>
            <FlexColumn gap={15} fullWidth>
                <FlexRow justifyContent="flex-end">
                    <H4>{event.item?.name}</H4>
                </FlexRow>
                <div className={styles.tableContainer}></div>
            </FlexColumn>
        </>
    );
};
