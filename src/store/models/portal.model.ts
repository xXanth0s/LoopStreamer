import {PORTALS} from '../enums/portals.enum';

export default interface Portal {
    key: PORTALS,
    index: number,
    regex: string,
    controllerName: PORTALS,
    baseUrl: string,
    seriesListUrl: string,
    name: string,
}
