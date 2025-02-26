import React, { useEffect } from 'react';
import { AddTagModal } from './AddTagModal';
import { LocalOffer } from '@mui/icons-material';
import { Photo } from '../../../../../../models/Photo';
import { Services } from '../../../../../../dependencies';

export const AddTagController = ({
    open,
    photo,
    onClose,
    onPhotoUpdated
}: {
    open: boolean;
    photo: Photo;
    onClose: () => void;
    onPhotoUpdated: (photo: Photo) => void;
}) => {
    const [tagOptions, setTagOptions] = React.useState<{ label: string; value: string }[]>([]);
    const [tags, setTags] = React.useState<string[]>(photo?.metadata.keywords || []);
    useEffect(() => {
        setTags(photo?.metadata.keywords || []);
    }, [photo]);
    const loadTags = async () => {
        const tags = await Services.events.getUniqueTags(photo.eventId);
        setTagOptions(
            tags.map((t) => ({
                label: t,
                value: t
            }))
        );
    };
    useEffect(() => {
        if (photo?.eventId) {
            loadTags();
        }
    }, [photo?.eventId]);
    return (
        <AddTagModal
            options={tagOptions}
            open={open}
            onAddTag={async (tag) => {
                const newTags = [...tags, tag];
                const updatedPhoto = {
                    ...photo,
                    metadata: {
                        ...photo.metadata,
                        keywords: newTags
                    }
                };
                await Services.events.updatePhoto(updatedPhoto);
                loadTags();
                setTags(newTags);
                onPhotoUpdated(updatedPhoto);
            }}
            onRemoveTag={async (tag) => {
                const newTags = tags.filter((t) => t !== tag);
                console.log('new tags', newTags, tags, tag);
                const updatedPhoto = {
                    ...photo,
                    metadata: {
                        ...photo.metadata,
                        keywords: newTags
                    }
                };
                await Services.events.updatePhoto(updatedPhoto);

                setTags(newTags);
                onPhotoUpdated(updatedPhoto);
            }}
            tags={tags}
            title="Add Tag"
            tagIcon={<LocalOffer style={{ fontSize: 18 }} />}
            onDone={onClose}
        />
    );
};
