import { StateModel } from '../models/state.model';
import Series from '../models/series.model';
import { PORTALS } from '../enums/portals.enum';
import { getNextEpisode, getSeriesEpisodeByKey } from './series-episode.selector';
import SeriesEpisode from '../models/series-episode.model';
import { getSeasonWithOffset } from './series-season.selector';
import { getLinksByKeys } from './línk.selector';

export const getAllSeries = (state: StateModel): Series[] => Object.values(state.series);

export const getAllWatchedSeries = (state: StateModel): Series[] => Object.values(state.series).filter(series => series.lastEpisodeWatched);

export const getSeriesByKey = (state: StateModel, seriesKey: Series['key']): Series => state.series[seriesKey];

export const getLastUsedEpisodeForSeries = (state: StateModel, seriesKey: Series['key']): PORTALS => getSeriesByKey(state, seriesKey)?.lastUsedPortal;

export const getSeriesForPortal = (state: StateModel, portal: PORTALS): Series[] => {
    return Object.values(state.series)
        .filter(series => {
            return getLinksByKeys(state, series.portalLinks)
                .some(link => link.portal === portal);
        });
};

export const getLastWatchedEpisode = (state: StateModel, seriesKey: Series['key']): SeriesEpisode => {
    const lastWatchedEpisodeKey = state.series[seriesKey]?.lastEpisodeWatched;
    if (!lastWatchedEpisodeKey) {
        return null;
    }

    return getSeriesEpisodeByKey(state, lastWatchedEpisodeKey);
};

export const isSeriesContinuable = (state: StateModel, seriesKey: Series['key']): boolean => {
    const lastWatchedEpisode = getLastWatchedEpisode(state, seriesKey);

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
