import { KeyModel } from './key-model.interface';

export interface NamedCollection<T extends KeyModel<any>> extends KeyModel<string> {
    title: string;
    data: Array<T['key']>;
}
