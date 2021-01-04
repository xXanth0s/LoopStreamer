import { StateModel } from '../models/state.model';
import { Series } from '../models/series.model';
import { getMultipleSeriesEpisodeByKeys, getSeriesEpisodeByKey } from './series-episode.selector';
import { SeriesEpisode } from '../models/series-episode.model';
import { getSeriesSeasonByKey } from './series-season.selector';
import { SeriesSeason } from '../models/series-season.model';
import { getSelectedSeasonKey } from './app-control-state.selector';
import { MovieApi } from '../enums/movie-api.enum';

export const getMultipleSeriesByKey = (state: StateModel,
                                       seriesKeys: Series['key'][]):
    Series[] => seriesKeys.map(key => getSeriesByKey(state, key));

export const getSeriesByKey = (state: StateModel, seriesKey: Series['key']): Series => state.series[seriesKey];

export const getLastWatchedOrFirstEpisodeForActiveSeason = (state: StateModel,
                                                            seriesKey: Series['key']): SeriesEpisode => {
    const lastWatchedEpisodeKey = state.series[seriesKey]?.lastEpisodeWatched;
    if (lastWatchedEpisodeKey) {
        return getSeriesEpisodeByKey(state, lastWatchedEpisodeKey);
    }

    const selectedSeasonKey = getSelectedSeasonKey(state);

    const season = getSeriesSeasonByKey(state, selectedSeasonKey);
    if (!season) {
        return null;
    }

    const episodes = getMultipleSeriesEpisodeByKeys(state, season.episodes);

    return episodes.find(episode => Boolean(episode.portalLinks.length));
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

export const getMovieDbApiKeysForSeries = (state: StateModel,
                                           seriesKeys: Series['key'][]): Series['apiKeys'][MovieApi.TMDB][] => {
    const series = getMultipleSeriesByKey(state, seriesKeys);
    return series.map(serie => serie.apiKeys[MovieApi.TMDB]);
};

export const getAllNotWatchedSeries = (state: StateModel): Series['key'][] => {
    const { watchedSeries, series } = state;
    const seriesKeys = Object.keys(series);

    return seriesKeys.filter(seriesKey => !watchedSeries.includes(seriesKey));
};
