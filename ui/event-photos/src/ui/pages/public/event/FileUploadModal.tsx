import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Icon,
    IconButton
} from '@mui/material';
import React, { useEffect } from 'react';
import { Photo } from '../../../../models/Photo';
import { v4 } from 'uuid';
import { useAuthor } from '../../../context/AuthorContext';
import { FlexColumn, FlexRow } from '../../../components/containers/Flex';
import { ImageCard } from './photoGallery/ImageCard';
import { Delete, LocalOffer, Person } from '@mui/icons-material';
import { AddPeopleController } from './photoGallery/addTagModal/AddPeopleController';
import { AddTagController } from './photoGallery/addTagModal/AddTagController';

export const FileUploadModal = ({
    eventId,
    files,
    onClose,

    onUpload
}: {
    eventId: string;
    files: File[] | null;
    onClose: () => any;
    onUpload: (photo: Photo[]) => any;
}) => {
    const [selected, setSelected] = React.useState<Photo | null>(null);
    const [editTags, setEditTags] = React.useState(false);
    const [editPeople, setEditPeople] = React.useState(false);
    const [photos, setPhotos] = React.useState<Photo[]>([]);
    const { author, authorName } = useAuthor();
    useEffect(() => {
        if (files) {
            const photos = files.map((file) => {
                const url = URL.createObjectURL(file);
                return {
                    photoId: v4(),
                    eventId: eventId,
                    contentType: file.type,
                    size: file.size,
                    name: file.name,
                    role: 'event',
                    author,
                    authorName,
                    url,
                    thumbnailUrl: url,
                    photoData: file,
                    metadata: {
                        people: [],
                        keywords: []
                    },
                    created: new Date().toISOString()
                } as Photo;
            });
            setPhotos(photos);
        } else {
            setPhotos([]);
        }
    }, [files]);

    return (
        <>
            <AddPeopleController
                open={editPeople}
                onClose={() => setEditPeople(false)}
                photo={selected!}
                onPhotoUpdated={(photo) => {
                    const newPhotos = photos.map((p) => (p.photoId === photo.photoId ? photo : p));
                    setPhotos(newPhotos);
                }}
            />
            <AddTagController
                open={editTags}
                onClose={() => setEditTags(false)}
                photo={selected!}
                onPhotoUpdated={(photo) => {
                    const newPhotos = photos.map((p) => (p.photoId === photo.photoId ? photo : p));
                    setPhotos(newPhotos);
                }}
            />
            <Dialog open={!!files} onClose={onClose}>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogContent>
                    <FlexRow wrap gap={15}>
                        {photos.map((photo) => (
                            <ImageCard
                                size={200}
                                leftActions={
                                    <FlexRow alignItems="flex-end" fullHeight>
                                        <FlexRow gap={5}>
                                            <IconButton
                                                style={{
                                                    color: '#fff',
                                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                                    borderRadius: '50%'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.nativeEvent.stopImmediatePropagation();
                                                    setSelected(photo);
                                                    setEditTags(true);
                                                }}
                                            >
                                                <LocalOffer style={{ fontSize: 12 }} />
                                            </IconButton>
                                            <IconButton
                                                style={{
                                                    color: '#fff',
                                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                                    borderRadius: '50%'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.nativeEvent.stopImmediatePropagation();
                                                    setSelected(photo);
                                                    setEditPeople(true);
                                                }}
                                            >
                                                <Person style={{ fontSize: 12 }} />
                                            </IconButton>
                                        </FlexRow>
                                    </FlexRow>
                                }
                                rightActions={
                                    <FlexRow alignItems="flex-start">
                                        <IconButton
                                            style={{
                                                color: '#fff',
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                borderRadius: '50%'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.nativeEvent.stopImmediatePropagation();
                                                const newPhotos = photos.filter(
                                                    (p) => p.photoId !== photo.photoId
                                                );
                                                setPhotos(newPhotos);
                                                if (newPhotos.length === 0) {
                                                    onClose();
                                                }
                                            }}
                                        >
                                            <Delete style={{ fontSize: 12 }} />
                                        </IconButton>
                                    </FlexRow>
                                }
                                photo={photo}
                                key={photo.photoId}
                                selected={false}
                            />
                        ))}
                    </FlexRow>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" variant="outlined" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button color="primary" variant="contained" onClick={() => onUpload(photos)}>
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
