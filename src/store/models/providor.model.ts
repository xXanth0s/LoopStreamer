import {PROVIDORS} from '../enums/providors.enum';

export default interface Providor {
    key: string,
    names: string[],
    index: number,
    url: string,
    controllerName: PROVIDORS,
    icon: string,
    urlRegex: string,
    isUsed: boolean
}
