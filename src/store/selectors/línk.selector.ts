import { StateModel } from '../models/state.model';
import Series from '../models/series.model';
import { PORTALS } from '../enums/portals.enum';
import { LinkModel } from '../models/link.model';
import { getSeriesByKey } from './series.selector';

export function getLinkForSeriesAndPortal(state: StateModel, seriesKey: Series['key'], portal: PORTALS): LinkModel {
    const series = getSeriesByKey(state, seriesKey);

    return getLinksByKeys(state, series.portalLinks).find(link => link.destination === portal);
}

export function getLinksByKeys(state: StateModel, linkKeys: LinkModel['key'][]): LinkModel[] {
    return linkKeys.map(key => state.links[key]);
}
