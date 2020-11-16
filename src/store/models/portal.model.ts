import { PORTALS } from '../enums/portals.enum';
import Website from './website';
import Series from './series.model';

export default interface Portal extends Website {
    key: PORTALS,
    index: number,
    controllerName: PORTALS,
    seriesListUrl: string,
    series: Series['key'][];
    name: string,
}
