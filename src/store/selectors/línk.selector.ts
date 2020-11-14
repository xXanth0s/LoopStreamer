import { StateModel } from '../models/state.model';
import Series from '../models/series.model';
import { PORTALS } from '../enums/portals.enum';
import { LinkModel } from '../models/link.model';
import { getSeriesByKey } from './series.selector';
import { SeriesSeason } from '../models/series-season.model';
import { getSeriesSeasonByKey } from './series-season.selector';

export function getLinkForSeriesAndPortal(state: StateModel, seriesKey: Series['key'], portal: PORTALS): LinkModel {
    const series = getSeriesByKey(state, seriesKey);

    return getLinksByKeys(state, series.portalLinks).find(link => link.portal === portal);
}

export function getLinksForSeriesSeasonAndPortal(state: StateModel, seriesSeasonKey: SeriesSeason['key'], portal: PORTALS): LinkModel[] {
    const season = getSeriesSeasonByKey(state, seriesSeasonKey);

    return getLinksByKeys(state, season.portalLinks).filter(link => link.portal === portal);
}

export function getLinksByKeys(state: StateModel, linkKeys: LinkModel['key'][]): LinkModel[] {
    return linkKeys.map(key => state.links[key]).filter(Boolean);
}
