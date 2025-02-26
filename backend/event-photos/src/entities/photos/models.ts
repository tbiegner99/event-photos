import { CommonFilter } from 'models/types';

export interface Photo {
  photoId: string;
  eventId: string;
  role: string;
  photoData?: Buffer;
  name: string;
  size: number;
  contentType: string;
  author?: string;
  authorName?: string;
  url?: string;
  thumbnailUrl?: string;
  created: string;
  lastModified: string;
  metadata: any;
}

export interface PhotoFilter extends CommonFilter {
  eventId: string;
  role?: string;
  type?: 'image' | 'video';
}
