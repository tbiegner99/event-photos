export interface PageInfo {
    pageSize: number;
    page: number;
}

export interface PageResult<T> extends PageInfo {
    total: number;
    hasMore: boolean;
    data: T[];
}
