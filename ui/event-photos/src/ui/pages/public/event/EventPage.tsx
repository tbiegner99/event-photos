import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './eventPage.module.css';
import { FlexColumn, FlexRow } from '../../../components/containers/Flex';
import UserIcon from '@mui/icons-material/ManageAccounts';
import MoreIcon from '@mui/icons-material/ExpandMore';
import { LoadedItem } from '../../../../utils/LoadedItem';
import { EventData } from '../../../../models/Event';
import { Services } from '../../../../dependencies';
import { PhotoUploader } from '../../../components/photoUploader/PhotoUploader';
import { Button, Divider } from '@mui/material';
import { PhotoGalleryController } from './photoGallery/PhotoGalleryController';
import { urls } from '../../../../utils/constants/urls';
import { FileUpload as FileUploader } from '../../../components/FileUpload';
import { AddAPhoto, Camera, CameraAlt, FileUpload, UploadFile } from '@mui/icons-material';
import { AddTagModal } from './photoGallery/addTagModal/AddTagModal';
import { FileUploadModal } from './FileUploadModal';
import { Photo } from '../../../../models/Photo';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import { H1, H3, H4 } from '../../../components/typography/Typography';
import { useAuthor } from '../../../context/AuthorContext';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';

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
    // React.useEffect(() => {
    //     if (event.isLoaded()) {
    //         const target = document.getElementById('photoUpload');
    //         const targetPosition = target!.getBoundingClientRect().top + window.pageYOffset;
    //         window.scrollTo({
    //             top: targetPosition,
    //             behavior: 'smooth'
    //         });
    //     }
    // }, [event]);
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
                fullWidth
                className={styles.appContent}
                style={{
                    backgroundImage: `url(/api/event-photos/v0/public/events/${eventId}/photos/${event.item?.heroImageId}/full)`
                }}
            >
                <FlexRow justifyContent="flex-end">
                    <UserIcon className={styles.login} onClick={() => onNavigate(urls.ADMIN)} />
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
                <FlexColumn gap={20} fullHeight>
                    <FlexRow justifyContent="space-between" alignItems="center">
                        <H4>Photo Gallery</H4>

                        <FlexRow gap={10}>
                            <Button
                                onClick={() => {
                                    localStorage.clear();
                                    clearAuthor();
                                }}
                            >
                                DEBUG
                            </Button>
                            <FileUploader
                                multiple={true}
                                accept="image/*,video/*"
                                icon={<UploadFile />}
                                title=" "
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
                                <AddAPhoto />
                            </Button>
                        </FlexRow>
                        {isUploading && (
                            <PhotoUploader
                                eventId={eventId}
                                onUploadImage={async (blob, metadata) => {
                                    await uploadPhoto(blob, metadata);
                                    setIsUploading(false);
                                }}
                                onUploadVideo={async (blob, metadata) => {
                                    await uploadPhoto(blob, metadata);
                                    setIsUploading(false);
                                }}
                                onClose={() => setIsUploading(false)}
                            />
                        )}
                    </FlexRow>
                    <Divider />
                    <FlexRow grow={1}>
                        <PhotoGalleryController eventId={eventId} />
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
