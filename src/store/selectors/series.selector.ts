import { StateModel } from '../models/state.model';
import Series from '../models/series.model';
import { PORTALS } from '../enums/portals.enum';
import { getFirstEpisodeForSeason, getNextEpisode, getSeriesEpisodeByKey } from './series-episode.selector';
import SeriesEpisode from '../models/series-episode.model';
import { getFirstSeasonForSeries, getSeasonWithOffset, getSeriesSeasonByKey } from './series-season.selector';
import { SeriesSeason } from '../models/series-season.model';
import { Logger } from '../../shared/services/logger';

export const getAllWatchedSeries = (state: StateModel): Series[] => Object.values(state.series).filter(series => series.lastEpisodeWatched);

export const getMultipleSeriesByKey = (state: StateModel, seriesKeys: Series['key'][]): Series[] => seriesKeys.map(key => getSeriesByKey(state, key));

export const getSeriesByKey = (state: StateModel, seriesKey: Series['key']): Series => state.series[seriesKey];

export const getLastUsedEpisodeForSeries = (state: StateModel, seriesKey: Series['key']): PORTALS => getSeriesByKey(state, seriesKey)?.lastUsedPortal;

export const getSeriesForPortal = (state: StateModel, portalKey: PORTALS): Series[] => {
    const portal = state.portals[portalKey];
    if (!portal) {
        Logger.error(`[getSeriesForPortal] no portal found for key ${portalKey}`);
        return [];
    }

    return getMultipleSeriesByKey(state, portal.series);
};

export const getLastWatchedOrFirstEpisodeForSeries = (state: StateModel, seriesKey: Series['key']): SeriesEpisode => {
    const lastWatchedEpisodeKey = state.series[seriesKey]?.lastEpisodeWatched;
    if (lastWatchedEpisodeKey) {
        return getSeriesEpisodeByKey(state, lastWatchedEpisodeKey);
    }

    const firstSeason = getFirstSeasonForSeries(state, seriesKey);

    return getFirstEpisodeForSeason(state, firstSeason?.key);

};

export const isSeriesContinuable = (state: StateModel, seriesKey: Series['key']): boolean => {
    const lastWatchedEpisode = getLastWatchedOrFirstEpisodeForSeries(state, seriesKey);

    if (!lastWatchedEpisode) {
        return false;
    }

    if (!lastWatchedEpisode.isFinished) {
        return true;
    }

    const nextEpisode = getNextEpisode(state, lastWatchedEpisode.key);
    if (nextEpisode) {
        return true;
    }

    const nextSeason = getSeasonWithOffset(state, lastWatchedEpisode.seasonKey, 1);

    return Boolean(nextSeason);
};

export const isEndTimeConfiguredForSeries = (state: StateModel, seriesKey: Series['key']): boolean => {
    const series = getSeriesByKey(state, seriesKey);
    return Boolean(series?.isEndTimeConfigured);
};

export const getSeriesForEpisode = (state: StateModel, seriesEpisodeKey: SeriesEpisode['key']): Series => {
    const episode = getSeriesEpisodeByKey(state, seriesEpisodeKey);
    return getSeriesByKey(state, episode?.seriesKey);
};

export const getSeriesForSeason = (state: StateModel, seriesSeasonKey: SeriesSeason['key']): Series => {
    const season = getSeriesSeasonByKey(state, seriesSeasonKey);
    return getSeriesByKey(state, season?.seriesKey);
};

export const getActiveOrLastUsedPortalForSeries = (state: StateModel, seriesKey: Series['key']): PORTALS => {
    const portal = state.appControlState.activePortal;
    if (portal) {
        return portal;
    }

    const series = getSeriesByKey(state, seriesKey);
    return series?.lastUsedPortal;
};
