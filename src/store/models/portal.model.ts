import {PORTALS} from '../enums/portals.enum';

export default interface Portal {
    key: string,
    index: number,
    regex: string,
    controllerName: PORTALS,
    url: string,
    // redirectUrl: string,
    name: string,
    iframeRegex: string
}
