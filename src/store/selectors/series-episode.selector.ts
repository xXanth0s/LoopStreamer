import { StateModel } from '../models/state.model';
import SeriesEpisode from '../models/series-episode.model';
import { getSeriesSeasonForEpisode } from './series-season.selector';

export const getSeriesEpisodeByKey = (state: StateModel, key: SeriesEpisode['key']): SeriesEpisode => state.seriesEpisodes[key];

export const getSeriesEpisodesByKeys = (state: StateModel, keys: SeriesEpisode['key'][]): SeriesEpisode[] => keys.map(key => getSeriesEpisodeByKey(state, key));

export const getNextEpisode = (state: StateModel, episodeKey: SeriesEpisode['key']): SeriesEpisode => {
    return getEpisodeWithOffset(state, episodeKey, 1);
}

export const hasSeriesEpisodeNextEpisode = (state: StateModel, key: SeriesEpisode['key']): boolean => {
    return Boolean(getNextEpisode(state, key));
};

export const getPreviousEpisode = (state: StateModel, episodeKey: SeriesEpisode['key']): SeriesEpisode => {
    return getEpisodeWithOffset(state, episodeKey, -1);
}

export const hasSeriesEpisodePreviousEpisode = (state: StateModel, key: SeriesEpisode['key']): boolean => {
    return Boolean(getPreviousEpisode(state, key));
};


const getEpisodeWithOffset = (state: StateModel, episodeKey: SeriesEpisode['key'], offset: number): SeriesEpisode => {
    const episode = getSeriesEpisodeByKey(state, episodeKey);
    const seriesSeason = getSeriesSeasonForEpisode(state, episodeKey);

    if (!seriesSeason || !episode) {
        console.error('[Series Episode Selector => hasSeriesEpisodeNextEpisode] season or episode not found');
        return null;
    }

    const seasonEpisodes = getSeriesEpisodesByKeys(state, seriesSeason.episodes);

    return seasonEpisodes.find(seaspmEpisode => seaspmEpisode.episodeNumber === (episode.episodeNumber + offset));
}
