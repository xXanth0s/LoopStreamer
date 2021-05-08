import { KeyObject } from './key-object.type';
import { KeyRecord } from './key.record.type';

export type KeyDictionary<T extends KeyObject> = Partial<KeyRecord<T>>

export type Dictionary<T extends string, P> = Partial<Record<T, P>>
