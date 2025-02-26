export interface GuestGroup {
  groupId: string;
  eventId: string;
  name: string;
  lastModified: Date;
  created: Date;
}

export interface Guest {
  guestId: string;
  eventId: string;
  groupId: string | null;
  name: string;
  lastModified: Date;
  created: Date;
}

export interface PageInfo {
  pageSize: number;
  page: number;
}

export interface PageResult<T> extends PageInfo {
  total: number;
  data: T[];
}

export interface CommonFilter {
  startDate?: string;
  endDate?: string;
}
