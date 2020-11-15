import { StateModel } from '../models/state.model';
import SeriesEpisode from '../models/series-episode.model';
import { SeriesSeason } from '../models/series-season.model';
import { sortArrayForKey } from '../../utils/array.utils';

export const getSeriesEpisodeByKey = (state: StateModel, key: SeriesEpisode['key']): SeriesEpisode => state.seriesEpisodes[key];

export const getSeriesEpisodesForSeason = (state: StateModel, seasonKey: SeriesEpisode['seasonKey']): SeriesEpisode[] => {
    return Object.values(state.seriesEpisodes).filter(episode => episode.seasonKey === seasonKey);
};

export const getNextEpisode = (state: StateModel, episodeKey: SeriesEpisode['key']): SeriesEpisode => {
    return getEpisodeWithOffset(state, episodeKey, 1);
};

export const hasSeriesEpisodeNextEpisode = (state: StateModel, key: SeriesEpisode['key']): boolean => {
    return Boolean(getNextEpisode(state, key));
};

export const getPreviousEpisode = (state: StateModel, episodeKey: SeriesEpisode['key']): SeriesEpisode => {
    return getEpisodeWithOffset(state, episodeKey, -1);
};

export const hasSeriesEpisodePreviousEpisode = (state: StateModel, key: SeriesEpisode['key']): boolean => {
    return Boolean(getPreviousEpisode(state, key));
};

export const getFirstEpisodeForSeason = (state: StateModel, key: SeriesSeason['key']): SeriesEpisode => {
    const seasonEpisodes = getSeriesEpisodesForSeason(state, key);
    if (!seasonEpisodes.length) {
        return null;
    }

    return sortArrayForKey(seasonEpisodes, (episode: SeriesEpisode) => episode.episodeNumber)[0];
};

export const getLastEpisodeForSeason = (state: StateModel, key: SeriesSeason['key']): SeriesEpisode => {
    const seasonEpisodes = getSeriesEpisodesForSeason(state, key);
    if (!seasonEpisodes.length) {
        return null;
    }

    const sortedArray = sortArrayForKey(seasonEpisodes, (episode: SeriesEpisode) => episode.episodeNumber);
    return sortedArray[sortedArray.length - 1];
};

export const getEpisodeWithOffset = (state: StateModel, episodeKey: SeriesEpisode['key'], offset: number): SeriesEpisode => {
    const episode = getSeriesEpisodeByKey(state, episodeKey);

    if (!episode) {
        console.error('[Series Episode Selector => hasSeriesEpisodeNextEpisode] season or episode not found');
        return null;
    }

    const seasonEpisodes = getSeriesEpisodesForSeason(state, episode.seasonKey);

    return seasonEpisodes.find(seasonEpisode => seasonEpisode.episodeNumber === (episode.episodeNumber + offset));
};
