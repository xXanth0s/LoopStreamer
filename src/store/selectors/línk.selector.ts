import { StateModel } from '../models/state.model';
import Series from '../models/series.model';
import { PORTALS } from '../enums/portals.enum';
import { LinkModel } from '../models/link.model';
import { getSeriesByKey } from './series.selector';
import { SeriesSeason } from '../models/series-season.model';
import { getSeasonsForSeries, getSeriesSeasonByKey } from './series-season.selector';
import { LANGUAGE } from '../enums/language.enum';
import { getSeriesEpisodeByKey, getSeriesEpisodesForSeason } from './series-episode.selector';
import SeriesEpisode from '../models/series-episode.model';
import { isLinkOutdated } from '../utils/link.utils';

export function getLinksForEpisode(state: StateModel, seriesEpisodeKey: SeriesEpisode['key']): LinkModel[] {
    const episode = getSeriesEpisodeByKey(state, seriesEpisodeKey);
    return getLinksByKeys(state, episode?.portalLinks) || [];
}

export function getLinkForSeriesAndPortal(state: StateModel, seriesKey: Series['key'], portal: PORTALS): LinkModel {
    const series = getSeriesByKey(state, seriesKey);
    return getLinksByKeys(state, series.portalLinks).find(link => link.portal === portal);
}

export function getLinksForSeriesSeasonAndPortal(state: StateModel, seriesSeasonKey: SeriesSeason['key'], portal: PORTALS): LinkModel[] {
    const season = getSeriesSeasonByKey(state, seriesSeasonKey);
    return getLinksByKeys(state, season.portalLinks).filter(link => link.portal === portal);
}

export function isSeriesUpToDate(state: StateModel, seriesKey: Series['key'], portal: PORTALS) {
    const seasons = getSeasonsForSeries(state, seriesKey);
    const links = getLinksByKeys(state, seasons.flatMap(episode => episode.portalLinks));

    const filteredLinks = links.filter(link => link.portal === portal);

    return filteredLinks.some(link => !isLinkOutdated(link));
}

export function isSeasonUpToDate(state: StateModel, seriesSeasonKey: SeriesSeason['key'], portal: PORTALS, language: LANGUAGE): boolean {
    const episode = getSeriesEpisodesForSeason(state, seriesSeasonKey);
    const links = getLinksByKeys(state, episode.flatMap(episode => episode.portalLinks));

    const filteredLinks = links.filter(link => link.portal === portal && link.language === language);

    return filteredLinks.some(link => !isLinkOutdated(link));
}

export function getPortalLinksForSeriesEpisodePortalAndLanguage(state: StateModel, seriesEpisodeKey: SeriesEpisode['key'], portal: PORTALS, language: LANGUAGE): LinkModel[] {
    const episode = getSeriesEpisodeByKey(state, seriesEpisodeKey);
    const links = getLinksByKeys(state, episode.portalLinks);

    return links.filter(link => link.portal === portal && link.language === language);
}

export function getLinksByKeys(state: StateModel, linkKeys: LinkModel['key'][] = []): LinkModel[] {
    return linkKeys.map(key => state.links[key]).filter(Boolean);
}
