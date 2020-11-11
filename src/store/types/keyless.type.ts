import { KeyObject } from './key-object.type';


export type Keyless<T extends KeyObject> = {
    [K in keyof T]: T[K]
} & { key?: string }
