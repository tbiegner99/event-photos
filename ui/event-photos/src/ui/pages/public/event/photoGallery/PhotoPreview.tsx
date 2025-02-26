import React from 'react';
import { FlexColumn, FlexRow } from '../../../../components/containers/Flex';
import Animate from 'react-smooth';
import { Button, Chip, IconButton, Switch } from '@mui/material';
import { Photo } from '../../../../../models/Photo';
import {
    ChevronLeftSharp,
    ChevronRightSharp,
    LocalOffer,
    Person,
    PersonAdd
} from '@mui/icons-material';
import styles from './photoPreview.css';
import { AddTagController } from './addTagModal/AddTagController';
import { AddPeopleController } from './addTagModal/AddPeopleController';
import { H3, H4, H5, H6 } from '../../../../components/typography/Typography';
import { PhotoMetadata } from './PhotoMetadata';

export const PhotoPreview = ({
    selected,
    prevSelected,
    slideshow,
    actionIcon,
    photos,
    onSelectionChanged,
    onSelectionDone,
    onSlideshowToggled,
    onPhotoUpdated
}: {
    selected: Photo;
    prevSelected?: Photo | null;
    slideshow: boolean;
    photos: Photo[];
    actionIcon?: React.ReactNode;
    onSelectionChanged: (photo: Photo) => any;
    onSelectionDone: () => any;
    onSlideshowToggled: (val: boolean) => any;
    onPhotoUpdated: (photo: Photo) => any;
}) => {
    const animatePhoto = (photo: Photo) => {
        return ({ opacity }) => (
            <div
                style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
                key={photo?.photoId + '_container'}
            >
                {photo?.contentType.startsWith('image') && (
                    <img
                        src={photo.url}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            opacity: opacity
                        }}
                    />
                )}
                {photo?.contentType.startsWith('video') && (
                    <video
                        style={{
                            width: '100%',
                            maxHeight: '85vh',
                            opacity: opacity
                        }}
                        src={photo.url}
                        controls
                        autoPlay={slideshow}
                    />
                )}
            </div>
        );
    };
    const [addTag, setAddTag] = React.useState(false);
    const [addPeople, setAddPeople] = React.useState(false);
    const selectedIndex = React.useMemo(() => {
        return photos.findIndex((p) => p.photoId === selected?.photoId);
    }, [photos, selected]);
    return (
        <>
            <AddTagController
                open={addTag}
                photo={selected}
                onPhotoUpdated={onPhotoUpdated}
                onClose={() => {
                    setAddTag(false);
                }}
            />
            <AddPeopleController
                open={addPeople}
                photo={selected}
                onPhotoUpdated={onPhotoUpdated}
                onClose={() => {
                    setAddPeople(false);
                }}
            />
            <FlexColumn gap={10} fullWidth fullHeight className={styles.previewContainer}>
                <FlexRow justifyContent="space-between">
                    <FlexRow gap={10} alignItems="center">
                        <span>Slideshow </span>
                        <Switch
                            checked={slideshow}
                            onChange={(e) => {
                                onSlideshowToggled(e.target.checked);
                            }}
                        />
                    </FlexRow>
                    {actionIcon || <div />}
                </FlexRow>
                <FlexRow justifyContent="center" style={{ position: 'relative', height: '70vh' }}>
                    {selected && (
                        <Animate
                            from={{ opacity: 0 }}
                            to={{ opacity: 1 }}
                            key={selected?.photoId}
                            duration={1500}
                        >
                            {animatePhoto(selected)}
                        </Animate>
                    )}
                    {prevSelected && (
                        <Animate
                            from={{ opacity: 1 }}
                            to={{ opacity: 0 }}
                            key={prevSelected?.photoId}
                            duration={1500}
                            onAnimationEnd={onSelectionDone}
                        >
                            {animatePhoto(prevSelected)}
                        </Animate>
                    )}
                </FlexRow>
                {selectedIndex >= 0 && (
                    <FlexRow justifyContent="space-between" alignItems="center">
                        <IconButton
                            onClick={() => {
                                onSelectionChanged(
                                    photos[(photos.length + selectedIndex - 1) % photos.length]
                                );
                            }}
                        >
                            <ChevronLeftSharp />
                        </IconButton>
                        <H6>
                            {selectedIndex + 1} / {photos.length}
                        </H6>
                        <IconButton
                            onClick={() => {
                                onSelectionChanged(photos[(selectedIndex + 1) % photos.length]);
                            }}
                        >
                            <ChevronRightSharp />
                        </IconButton>
                    </FlexRow>
                )}
                {selected != null && (
                    <PhotoMetadata
                        photo={selected}
                        onAddTag={() => setAddTag(true)}
                        onAddPeople={() => setAddPeople(true)}
                    />
                )}
            </FlexColumn>
        </>
    );
};
