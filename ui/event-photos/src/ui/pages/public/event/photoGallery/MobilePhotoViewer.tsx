import { Drawer, IconButton } from '@mui/material';
import { FlexColumn, FlexRow } from '../../../../components/containers/Flex';
import React from 'react';
import { Close } from '@mui/icons-material';
import styles from './mobilePhotoViewer.css';
import { PhotoPreview } from './PhotoPreview';
import { Photo } from '../../../../../models/Photo';

export const MobilePhotoViewer = ({
    open,
    slideshow,
    selected,
    photos,
    onSelectionChanged,
    onSlideshowToggle,
    onClose,
    onPhotoUpdated
}: {
    slideshow: boolean;
    selected: Photo | null;
    photos: Photo[];
    onSelectionChanged: (photo: Photo) => void;
    onSlideshowToggle: (val: boolean) => void;
    onClose: () => void;
    onPhotoUpdated: (photo: Photo) => void;
    open: boolean;
}) => {
    return (
        <Drawer open={open} anchor={'right'} variant={'persistent'}>
            <FlexColumn gap={15} className={styles.drawer}>
                <FlexRow fullWidth justifyContent="center">
                    <PhotoPreview
                        selected={selected!}
                        slideshow={slideshow}
                        photos={photos}
                        onPhotoUpdated={onPhotoUpdated}
                        onSelectionChanged={onSelectionChanged}
                        onSlideshowToggled={onSlideshowToggle}
                        prevSelected={null}
                        actionIcon={
                            <IconButton onClick={onClose}>
                                <Close />
                            </IconButton>
                        }
                        onSelectionDone={() => {
                            //setPrevSelected(null);
                        }}
                    />
                </FlexRow>
            </FlexColumn>
        </Drawer>
    );
};
