import { KeyModel } from './key-model.interface';
import { CollectionType } from '../enums/collection-key.enum';

export interface NamedCollection<T extends KeyModel<any>> extends KeyModel<string> {
    title: string;
    type: CollectionType;
    data: Array<T['key']>;
}
