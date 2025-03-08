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
import { Link as LinkIcon, QrCode, UploadFile } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { urls } from '../../../../utils/constants';
import { H1, H4, H5, H6 } from '../../../components/typography/Typography';

export const EventsPage = ({
    onSave,
    events
}: {
    onSave: (data: EventData) => Promise<any>;
    events: LoadedItem<EventData[]>;
}) => {
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
                        src={`${process.env.IMAGE_BUCKET_URL}/events/${params.row.eventId}/hero/thumbnails/${params.value}`}
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
            width: 170,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                return [
                    <Link to={urls.event(id as string)}>
                        <GridActionsCellItem
                            title="Go To Event Page"
                            icon={<LinkIcon />}
                            label="Edit"
                            className="textPrimary"
                            color="inherit"
                        />
                    </Link>,
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
                            const item = events.item?.find((e) => e.eventId === id);
                            if (item) {
                                setRole('edit');
                                setIsAdding(true);
                                setAdding(item);
                            }
                        }}
                        color="inherit"
                    />,
                    <Link to={urls.eventQR(id as string)} target="_blank">
                        <GridActionsCellItem
                            icon={<QrCode />}
                            label="QR Code"
                            className="textPrimary"
                            color="inherit"
                        />
                    </Link>
                ];
            }
        }
    ];
    const [isAdding, setIsAdding] = React.useState(false);
    const [adding, setAdding] = React.useState<Partial<EventData>>({});
    const [role, setRole] = React.useState<string>('add');
    const canSave = () => {
        return (
            adding &&
            Boolean(adding.name) &&
            Boolean(adding.location) &&
            (Boolean(adding.heroImage) || Boolean(adding.heroImageId))
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
                                setRole('add');
                                setAdding({
                                    eventId: v4(),
                                    description: '',
                                    location: '',
                                    name: '',
                                    config: {
                                        qrSize: 400,
                                        pollInterval: 30000
                                    },
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
                <FlexColumn className={styles.addForm} gap={20}>
                    <H4>{role === 'edit' ? 'Editing Event' : 'Add New Event'}</H4>
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
                            <H6>App Config </H6>
                            <TextField
                                size="small"
                                value={adding?.config?.backgroundPosition}
                                onChange={(evt) => {
                                    setAdding((adding) => ({
                                        ...adding,
                                        config: {
                                            ...adding.config,
                                            backgroundPosition: evt.target.value
                                        }
                                    }));
                                }}
                                label="Background Position"
                            />
                            <TextField
                                size="small"
                                value={adding?.config?.pollInterval || 30000}
                                onChange={(evt) => {
                                    setAdding((adding) => ({
                                        ...adding,
                                        config: {
                                            ...adding.config,
                                            pollInterval: evt.target.value
                                        }
                                    }));
                                }}
                                label="Poll Interval"
                            />
                            <TextField
                                size="small"
                                value={adding?.config?.qrSize || 400}
                                onChange={(evt) => {
                                    setAdding((adding) => ({
                                        ...adding,
                                        config: {
                                            ...adding.config,
                                            qrSize: evt.target.value
                                        }
                                    }));
                                }}
                                label="QR Size"
                            />
                            <TextField
                                size="small"
                                multiline
                                rows={8}
                                value={adding?.config?.text}
                                onChange={(evt) => {
                                    setAdding((adding) => ({
                                        ...adding,
                                        config: {
                                            ...adding.config,
                                            text: evt.target.value
                                        }
                                    }));
                                }}
                                label="Text"
                            />
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
