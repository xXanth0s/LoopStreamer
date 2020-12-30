import { PROVIDORS } from '../enums/providors.enum';
import { Website } from './website';

export interface Providor extends Website {
    key: PROVIDORS;
    names: string[];
    index: number;
    controllerName: PROVIDORS;
    icon: string;
    isUsed: boolean;
}
