export interface Photo {
    photoId: string;
    eventId: string;
    role: string;
    photoData?: Blob;
    name: string;
    size: number;
    contentType: string;
    author?: string;
    authorName?: string;
    url?: string;
    thumbnailUrl?: string;
    created: string;
    metadata: any;
}

export interface PhotoFilters {
    eventId: string;
    startDate?: Date;
    endDate?: Date;
}
