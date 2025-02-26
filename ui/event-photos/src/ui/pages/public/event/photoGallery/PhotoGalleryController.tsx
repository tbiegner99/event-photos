import React, { useEffect } from 'react';
import { PhotoGallery } from './PhotoGallery';
import { LoadedItem } from '../../../../../utils/LoadedItem';
import { Photo, PhotoFilters } from '../../../../../models/Photo';
import { Services } from '../../../../../dependencies';
import { PageInfo } from '../../../../../models/Pagination';

const PHOTO_POLL_INTERVAL = 10000;
const PHOTO_PAGE_SIZE = 6;

export const PhotoGalleryController = ({ eventId }: { eventId: string }) => {
    const [pageInfo, setPageInfo] = React.useState({
        page: 0,
        pageSize: PHOTO_PAGE_SIZE
    });
    const loadDate = React.useRef(new Date());
    const photosPoll = React.useRef<number | null>(null);
    const [hasMorePhotos, setHasMorePhotos] = React.useState(true);
    const [photos, setPhotos] = React.useState<LoadedItem<Photo[]>>(LoadedItem.unloaded());
    const loadPhotos = async (pageInfo: PageInfo, filters: PhotoFilters) => {
        setPhotos(LoadedItem.loading(photos.item || undefined));
        const loadedPhotos = await Services.events.loadEventPhotos(eventId, pageInfo, filters);
        setHasMorePhotos(loadedPhotos.hasMore);
        setPhotos(LoadedItem.loaded([...(photos.item || []), ...loadedPhotos.data]));
    };
    const pollNewPhotos = async () => {
        const loadedPhotos = await Services.events.loadEventPhotos(
            eventId,
            {
                page: 0,
                pageSize: PHOTO_PAGE_SIZE
            },
            {
                eventId,
                startDate: loadDate.current
            }
        );
        loadDate.current = new Date();
        console.log('polling', loadedPhotos);
        if (loadedPhotos.data.length > 0) {
            setPhotos(LoadedItem.loaded([...loadedPhotos.data, ...(photos.item || [])]));
        }
    };
    useEffect(() => {
        loadPhotos(pageInfo, { eventId, endDate: loadDate.current });
    }, [pageInfo]);
    useEffect(() => {
        photosPoll.current = window.setInterval(() => {
            pollNewPhotos();
        }, PHOTO_POLL_INTERVAL);
        return () => {
            if (photosPoll.current) {
                window.clearInterval(photosPoll.current);
            }
        };
    }, [photos]);
    const onPhotoUpdated = (photo) => {
        setPhotos(
            LoadedItem.loaded(
                photos.item?.map((p) => (p.photoId === photo.photoId ? photo : p)) || []
            )
        );
    };
    return (
        <PhotoGallery
            photos={photos}
            hasMorePhotos={hasMorePhotos}
            onPhotoUpdated={onPhotoUpdated}
            onLoadMore={() =>
                setPageInfo({
                    pageSize: pageInfo.pageSize,
                    page: pageInfo.page + 1
                })
            }
        />
    );
};
