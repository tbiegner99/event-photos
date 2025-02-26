import React, { useEffect } from 'react';
import { AddTagModal } from './AddTagModal';
import { Person } from '@mui/icons-material';
import { Photo } from '../../../../../../models/Photo';
import { Services } from '../../../../../../dependencies';

export const AddPeopleController = ({
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
    const [tags, setTags] = React.useState<string[]>(photo?.metadata.people || []);
    useEffect(() => {
        setTags(photo?.metadata.people || []);
    }, [photo]);
    const loadPeople = async () => {
        const tags = await Services.events.getUniquePeople(photo.eventId);
        setTagOptions(
            tags.map((t) => ({
                label: t,
                value: t
            }))
        );
    };
    useEffect(() => {
        if (photo?.eventId) {
            loadPeople();
        }
    }, [photo?.eventId]);
    return (
        <AddTagModal
            open={open}
            options={tagOptions}
            onAddTag={async (tag) => {
                const newTags = [...tags, tag];
                const updatedPhoto = {
                    ...photo,
                    metadata: {
                        ...photo.metadata,
                        people: newTags
                    }
                };
                await Services.events.updatePhoto(updatedPhoto);
                setTags(newTags);
                onPhotoUpdated(updatedPhoto);
            }}
            onRemoveTag={async (tag) => {
                const newTags = tags.filter((t) => t !== tag);
                const updatedPhoto = {
                    ...photo,
                    metadata: {
                        ...photo.metadata,
                        people: newTags
                    }
                };
                await Services.events.updatePhoto(updatedPhoto);
                setTags(newTags);
                onPhotoUpdated(updatedPhoto);
            }}
            tags={tags}
            title="Add People"
            tagIcon={<Person style={{ fontSize: 18 }} />}
            onDone={onClose}
        />
    );
};
