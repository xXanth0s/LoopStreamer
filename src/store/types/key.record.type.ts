import { KeyObject } from './key-object.type';

export type KeyRecord<T extends KeyObject> = Record<T['key'], T>
