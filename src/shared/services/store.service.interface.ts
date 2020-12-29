// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IStoreService<T> {

    subscribe(listener: () => void): () => void;

    getState(): T;

    dispatch<A>(data: A): void | Promise<void>;
}
