import {PORTALS} from '../enums/portals.enum';

export default interface Portal {
    key: PORTALS,
    index: number,
    controllerName: PORTALS,
    baseUrl: string,
    urlRegex: string,
    seriesListUrl: string,
    name: string,
}
