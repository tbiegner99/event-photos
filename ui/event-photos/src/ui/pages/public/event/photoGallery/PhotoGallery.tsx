import React from 'react';
import { LoadedItem } from '../../../../../utils/LoadedItem';
import { Photo } from '../../../../../models/Photo';
import { FlexColumn, FlexRow } from '../../../../components/containers/Flex';
import { ImageCard } from './ImageCard';
import { Resizable } from 're-resizable';
import { Switch } from '@mui/material';
import Animate from 'react-smooth';
import { useInView } from 'react-intersection-observer';
import { PhotoPreview } from './PhotoPreview';
import { useViewport } from '../../../../context/ViewportContext';
import { MobilePhotoViewer } from './MobilePhotoViewer';
import { H3, H5 } from '../../../../components/typography/Typography';

const SLIDESHOW_TIME = 10000;

export const PhotoGallery = ({
    hasMorePhotos,
    onLoadMore,
    onPhotoUpdated,
    photos
}: {
    onLoadMore: () => void;
    onPhotoUpdated: (photo: Photo) => void;
    hasMorePhotos: boolean;
    photos: LoadedItem<Photo[]>;
}) => {
    const [slideshow, setSlideshow] = React.useState(false);
    const slideshowInterval = React.useRef<number | null>(null);
    const [selected, setSelected] = React.useState<Photo | null>(null);
    const [prevSelected, setPrevSelected] = React.useState<Photo | null>(null);
    const { isMobile } = useViewport();
    const [ref, inView] = useInView();
    const [previewOpen, setPreviewOpen] = React.useState(false);

    React.useEffect(() => {
        setPreviewOpen(false);
    }, [isMobile]);
    React.useEffect(() => {
        if (inView) {
            onLoadMore();
        }
    }, [inView]);
    React.useEffect(() => {
        if (slideshow) {
            if (photos.item && photos.item?.length > 0 && !selected) {
                setSelected(photos.item![0]);
            }
            slideshowInterval.current = window.setInterval(() => {
                if (photos.item?.length === 0) {
                    return;
                }
                const currentIndex = photos.item!.findIndex(
                    (photo) => photo.photoId === selected?.photoId
                );
                const nextIndex = (currentIndex + 1) % photos.item!.length;
                setPrevSelected(selected);
                setSelected(photos.item![nextIndex]);
            }, SLIDESHOW_TIME);
            return () => {
                if (slideshowInterval.current) {
                    window.clearInterval(slideshowInterval.current);
                }
            };
        }
    }, [slideshow, selected]);

    return (
        <FlexColumn fullHeight justifyContent="space-between" fullWidth>
            <FlexRow fullWidth grow={1}>
                <FlexColumn fullHeight grow={1} gap={20}>
                    <FlexRow wrap gap={15}>
                        {photos.item?.map((photo) => (
                            <ImageCard
                                key={photo.photoId}
                                photo={photo}
                                onSelect={() => {
                                    setPreviewOpen(true);
                                    setPrevSelected(selected);
                                    setSelected(photo);
                                }}
                                selected={selected?.photoId === photo.photoId}
                            />
                        ))}
                    </FlexRow>
                    <FlexRow justifyContent="center">
                        {hasMorePhotos ? <H5 ref={ref}>Load More</H5> : <H5>All Photos Loaded</H5>}
                    </FlexRow>
                    <div />
                </FlexColumn>
                {!isMobile && (
                    <Resizable
                        minWidth={'300px'}
                        style={{
                            borderLeft: '1px solid rgba(0,0,0,0.12)'
                        }}
                        defaultSize={{
                            width: '50%'
                        }}
                        enable={{
                            left: true,
                            right: false,
                            top: false,
                            bottom: false,
                            topRight: false,
                            bottomRight: false,
                            bottomLeft: false,
                            topLeft: false
                        }}
                    >
                        <PhotoPreview
                            selected={selected!}
                            slideshow={slideshow}
                            photos={photos.item || []}
                            onSlideshowToggled={setSlideshow}
                            prevSelected={prevSelected}
                            onPhotoUpdated={onPhotoUpdated}
                            onSelectionChanged={(photo) => {
                                setPrevSelected(selected);
                                setSelected(photo);
                            }}
                            onSelectionDone={() => {
                                setPrevSelected(null);
                            }}
                        />
                    </Resizable>
                )}
                {isMobile && (
                    <MobilePhotoViewer
                        selected={selected}
                        onSlideshowToggle={setSlideshow}
                        photos={photos.item || []}
                        slideshow={slideshow}
                        onPhotoUpdated={onPhotoUpdated}
                        open={previewOpen}
                        onSelectionChanged={(photo) => {
                            setPrevSelected(selected);
                            setSelected(photo);
                        }}
                        onClose={() => setPreviewOpen(false)}
                    />
                )}
            </FlexRow>
        </FlexColumn>
    );
};
