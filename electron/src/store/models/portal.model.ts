import { PORTALS } from '../enums/portals.enum';
import Website from './website';

export default interface Portal extends Website {
    key: PORTALS,
    index: number,
    controllerName: PORTALS,
    seriesListUrl: string,
    name: string,
}
