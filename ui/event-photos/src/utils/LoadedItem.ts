export enum LoadingState {
    Unloaded,
    Loading,
    Loaded,
    Error
}
export class LoadedItem<T> {
    private constructor(
        private _state: LoadingState,
        private _item: T | null,
        private _error?: any
    ) {}

    get item(): T | null {
        return this._item;
    }

    get error(): any {
        return this._error;
    }

    isUnloaded() {
        return this._state === LoadingState.Unloaded;
    }

    isLoading() {
        return this._state === LoadingState.Loading;
    }
    isLoaded() {
        return this._state === LoadingState.Loaded;
    }
    isError() {
        return this._state === LoadingState.Error;
    }

    loading() {
        return new LoadedItem(LoadingState.Loading, this.item);
    }

    static unloaded<T>(value?: T) {
        return new LoadedItem<T>(LoadingState.Unloaded, value || null);
    }

    static loading<T>(value?: T) {
        return new LoadedItem<T>(LoadingState.Loading, value || null);
    }

    static loaded<T>(item: T) {
        return new LoadedItem<T>(LoadingState.Loaded, item);
    }
    static error<T>(error: any) {
        return new LoadedItem<T>(LoadingState.Error, null, error);
    }
}
