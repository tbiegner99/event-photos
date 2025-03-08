import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './eventPage.module.css';
import { FlexColumn, FlexRow } from '../../../components/containers/Flex';
import UserIcon from '@mui/icons-material/ManageAccounts';
import MoreIcon from '@mui/icons-material/ExpandMore';
import { LoadedItem } from '../../../../utils/LoadedItem';
import { EventData } from '../../../../models/Event';
import { Button, Divider } from '@mui/material';
import { PhotoGalleryController } from './photoGallery/PhotoGalleryController';
import { urls } from '../../../../utils/constants/urls';
import { FileUpload as FileUploader } from '../../../components/FileUpload';
import { AddAPhoto, QrCode, UploadFile } from '@mui/icons-material';
import { FileUploadModal } from './FileUploadModal';
import { Photo } from '../../../../models/Photo';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import { H4 } from '../../../components/typography/Typography';
import { useAuthor } from '../../../context/AuthorContext';

export function EventPage({
    eventId,
    event,
    onUpload
}: {
    eventId: string;
    event: LoadedItem<EventData>;
    onUpload: (photo: Photo) => Promise<any>;
}) {
    const onNavigate = useNavigate();
    const { authorName, author, promptForAuthor, clearAuthor } = useAuthor();
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadFiles, setUploadFiles] = React.useState<File[] | null>(null);

    const uploadPhoto = async (blob: Blob, metadata: any) => {
        const photoId = v4();
        const photo = {
            photoId: photoId,
            eventId: eventId,
            contentType: blob.type,
            size: blob.size,
            name: photoId,
            role: 'event',
            metadata,
            created: dayjs().toISOString(),
            author: author || undefined,
            authorName: authorName,
            photoData: blob
        };
        await onUpload(photo);
    };

    if (!event.isLoaded()) {
        return null;
    }
    return (
        <section className={styles.appContainer}>
            <FlexColumn
                className={styles.appContent}
                style={{
                    height: '100vh',
                    width: '100vw',
                    zIndex: '-1',

                    position: 'fixed',
                    backgroundPosition: `${event.item?.config?.backgroundPosition || 'center'} center`,
                    backgroundImage: `url(/api/event-photos/v0/public/events/${eventId}/photos/${event.item?.heroImageId}/full)`
                }}
            >
                {event.item?.config?.text && (
                    <div
                        style={{
                            userSelect: 'none',
                            position: 'absolute'
                        }}
                        dangerouslySetInnerHTML={{ __html: event.item?.config?.text }}
                    ></div>
                )}
            </FlexColumn>
            <FlexColumn
                fullWidth
                style={{
                    height: '100vh'
                }}
            >
                <FlexRow justifyContent="flex-end">
                    <FlexRow gap={10} style={{ marginRight: 10 }}>
                        <QrCode
                            className={styles.login}
                            onClick={() => window.open(urls.eventQR(eventId), '_blank')}
                        />
                        <UserIcon className={styles.login} onClick={() => onNavigate(urls.ADMIN)} />
                    </FlexRow>
                </FlexRow>
                <FlexRow grow={1}></FlexRow>

                <FlexRow justifyContent="center">
                    <MoreIcon
                        className={styles.scrollDown}
                        onClick={() => {
                            const target = document.getElementById('photoUpload');
                            const targetPosition =
                                target!.getBoundingClientRect().top + window.pageYOffset;
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }}
                    />
                </FlexRow>
            </FlexColumn>
            <footer id="photoUpload" className={styles.otherContent}>
                <FlexColumn gap={20}>
                    <FlexColumn gap={10}>
                        <H4>Gallery</H4>
                        <FlexRow gap={10}>
                            <FileUploader
                                multiple={true}
                                accept="image/*,video/*"
                                icon={<UploadFile />}
                                title="Upload"
                                onBeforePrompt={async () => {
                                    if (!authorName) {
                                        await promptForAuthor();
                                    }
                                }}
                                onChange={function (file: File[] | null): void {
                                    setUploadFiles(file);
                                }}
                            />
                            <Button
                                variant={'contained'}
                                color="primary"
                                onClick={async () => {
                                    if (!authorName) {
                                        await promptForAuthor();
                                    }
                                    setIsUploading(true);
                                }}
                            >
                                <FlexRow gap={10}>
                                    <AddAPhoto />
                                    <span>Take</span>
                                </FlexRow>
                            </Button>
                            {process.env.DEBUG && (
                                <Button
                                    onClick={() => {
                                        clearAuthor();
                                    }}
                                >
                                    DEBUG
                                </Button>
                            )}
                        </FlexRow>
                    </FlexColumn>
                    <Divider />
                    <FlexRow grow={1}>
                        <PhotoGalleryController
                            isUploading={isUploading}
                            onUpload={async (blob, metadata) => {
                                await uploadPhoto(blob, metadata);
                                setIsUploading(false);
                            }}
                            onUploadCancelled={() => setIsUploading(false)}
                            eventId={eventId}
                            event={event.item!}
                        />
                    </FlexRow>
                </FlexColumn>

                <FileUploadModal
                    eventId={eventId}
                    files={uploadFiles}
                    onUpload={async (photos) => {
                        for (const photo of photos) {
                            await onUpload(photo);
                        }
                        setUploadFiles(null);
                    }}
                    onClose={() => setUploadFiles(null)}
                />
            </footer>
        </section>
    );
}
