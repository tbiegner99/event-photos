import React from 'react';
import { FlexColumn, FlexRow } from '../../../components/containers/Flex';
import { Button, Drawer, TextField } from '@mui/material';
import { RequireRole } from '../../../components/RequireRole';
import styles from './events.module.css';
import EditIcon from '@mui/icons-material/Edit';
import CopyIcon from '@mui/icons-material/CopyAll';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { ImageUpload } from '../../../components/ImageUpload';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { EventData } from '../../../../models/Event';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import { LoadedItem } from '../../../../utils/LoadedItem';
import { Link, UploadFile } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { urls } from '../../../../utils/constants';
import { H1 } from '../../../components/typography/Typography';

export const EventsPage = ({
    onSave,
    events
}: {
    onSave: (data: EventData) => Promise<any>;
    events: LoadedItem<EventData[]>;
}) => {
    const onNavigate = useNavigate();
    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Event', flex: 2 },
        { field: 'description', headerName: 'Description', flex: 3 },
        {
            field: 'heroImageId',
            headerName: 'Image',
            flex: 1,
            align: 'center',
            renderCell: (params) => {
                return (
                    <img
                        src={`https://storage.googleapis.com/event-photos.tjbiegner.com/events/${params.row.eventId}/hero/thumbnails/${params.value}`}
                        alt="Event"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                );
            }
        },
        { field: 'location', headerName: 'Location', flex: 1 },
        { field: 'eventDate', type: 'dateTime', headerName: 'Event Date', width: 180 },
        { field: 'lastModified', type: 'dateTime', headerName: 'Last Modified', width: 180 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                return [
                    <GridActionsCellItem
                        title="Go To Event Page"
                        icon={<Link />}
                        label="Edit"
                        className="textPrimary"
                        onClick={() => {
                            onNavigate(urls.event(id as string));
                        }}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        title="Copy Id"
                        icon={<CopyIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={() => {
                            navigator.clipboard.writeText(id as string);
                        }}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={() => {
                            onNavigate(urls.adminEvent(id as string));
                        }}
                        color="inherit"
                    />
                ];
            }
        }
    ];
    const [isAdding, setIsAdding] = React.useState(false);
    const [adding, setAdding] = React.useState<Partial<EventData>>({});
    const canSave = () => {
        return (
            adding && Boolean(adding.name) && Boolean(adding.location) && Boolean(adding.heroImage)
        );
    };
    return (
        <>
            <FlexColumn gap={15} fullWidth>
                <FlexRow justifyContent="flex-end">
                    <RequireRole roles={['system_admin', 'events_admin']}>
                        <Button
                            onClick={() => {
                                setIsAdding(true);
                                setAdding({
                                    eventId: v4(),
                                    description: '',
                                    location: '',
                                    name: '',
                                    eventDate: dayjs().toDate(),
                                    createdDate: dayjs().toDate()
                                });
                            }}
                            variant={'contained'}
                        >
                            Create Event
                        </Button>
                    </RequireRole>
                </FlexRow>
                <div className={styles.tableContainer}>
                    <DataGrid
                        columns={columns}
                        getRowId={(row) => row.eventId}
                        rows={events.item || []}
                        loading={events.isLoading()}
                    ></DataGrid>
                </div>
            </FlexColumn>
            <Drawer open={isAdding} anchor={'right'} onClose={() => setIsAdding(false)}>
                <FlexColumn className={styles.addForm}>
                    <H1>Add New Event</H1>
                    <FlexColumn style={{ height: '100%' }}>
                        <FlexColumn grow={1} gap={20}>
                            <TextField
                                size="medium"
                                value={adding.name}
                                onChange={(evt) => {
                                    setAdding((adding) => ({ ...adding, name: evt.target.value }));
                                }}
                                label="Name"
                            />
                            <TextField
                                size="medium"
                                value={adding.description}
                                onChange={(evt) => {
                                    setAdding((adding) => ({
                                        ...adding,
                                        description: evt.target.value
                                    }));
                                }}
                                label="Description"
                                multiline
                                rows={2}
                            />
                            <TextField
                                size="medium"
                                value={adding.location}
                                onChange={(evt) => {
                                    setAdding((adding) => ({
                                        ...adding,
                                        location: evt.target.value
                                    }));
                                }}
                                label="Location"
                            />
                            <FlexRow gap={10}>
                                <DatePicker
                                    disablePast
                                    label="Date"
                                    value={adding.eventDate ? dayjs(adding.eventDate) : null}
                                    onChange={(value) => {
                                        setAdding((adding) => ({
                                            ...adding,
                                            eventDate: value!.toDate()
                                        }));
                                    }}
                                />
                                <TimePicker
                                    label="Time"
                                    value={adding.eventDate ? dayjs(adding.eventDate) : null}
                                    onChange={(value) => {
                                        setAdding((adding) => ({
                                            ...adding,
                                            eventDate: value!.toDate()
                                        }));
                                    }}
                                />
                            </FlexRow>
                            <FlexRow justifyContent="flex-end">
                                <ImageUpload
                                    title={<UploadFile />}
                                    onChange={(files) => {
                                        const file = files[0];
                                        if (!file) {
                                            setAdding((adding) => ({
                                                ...adding,
                                                heroImage: undefined
                                            }));
                                            return;
                                        }

                                        setAdding((adding) => ({
                                            ...adding,
                                            heroImage: {
                                                photoId: v4(),
                                                eventId: adding.eventId!,
                                                role: 'hero',
                                                photoData: file,
                                                name: file.name,
                                                size: file.size,
                                                contentType: file.type,
                                                author: '',
                                                authorName: '',
                                                created: dayjs().toISOString(),
                                                metadata: {}
                                            }
                                        }));
                                    }}
                                />
                            </FlexRow>
                        </FlexColumn>
                        <FlexRow justifyContent="flex-end" gap={10}>
                            <Button onClick={() => setIsAdding(false)} variant="outlined">
                                Cancel
                            </Button>
                            <Button
                                disabled={!canSave()}
                                onClick={async () => {
                                    await onSave(adding as EventData);
                                    setIsAdding(false);
                                    setAdding({});
                                }}
                                variant="contained"
                            >
                                Save
                            </Button>
                        </FlexRow>
                    </FlexColumn>
                </FlexColumn>
            </Drawer>
        </>
    );
};
