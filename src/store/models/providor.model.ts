import { PROVIDORS } from '../enums/providors.enum';
import Website from './website';

export default interface Providor extends Website {
    key: PROVIDORS,
    names: string[],
    index: number,
    controllerName: PROVIDORS,
    icon: string,
    isUsed: boolean
}
