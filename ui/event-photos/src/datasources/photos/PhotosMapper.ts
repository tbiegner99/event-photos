import { PageResult } from '../../models/Pagination';
import { Photo } from '../../models/Photo';

export class PhotosMapper {
    fromPhotoResponse(photo: any): PageResult<Photo> {
        return {
            page: photo.page,
            pageSize: photo.pageSize,
            total: photo.total,
            hasMore: photo.data.length === photo.pageSize,
            data: photo.data.map((photo: any) => this.mapPhoto(photo))
        };
    }

    mapPhoto(photo: any): Photo {
        return {
            photoId: photo.photoId,
            eventId: photo.eventId,
            role: photo.role,
            name: photo.name,
            size: photo.size,
            contentType: photo.contentType,
            thumbnailUrl: photo.thumbnailUrl,
            url: photo.url,
            metadata: photo.metadata,
            created: photo.created,
            author: photo.author,
            authorName: photo.authorName
        };
    }

    toAddRequest(photo: Photo) {
        const formData = new FormData();
        if (photo.photoData) {
            formData.append('photo', photo.photoData!);
        }

        formData.append('eventId', photo.eventId);
        formData.append('photoId', photo.photoId);
        formData.append('role', photo.role);
        formData.append('name', photo.name);
        formData.append('size', photo.size.toString());
        formData.append('contentType', photo.contentType);
        if (photo.author) {
            formData.append('author', photo.author);
        }
        if (photo.authorName) {
            formData.append('authorName', photo.authorName);
        }
        formData.append('created', photo.created);
        formData.append('metadata', JSON.stringify(photo.metadata));

        return formData;
    }
}
