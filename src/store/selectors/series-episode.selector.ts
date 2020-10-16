import { StateModel } from '../models/state.model';
import SeriesEpisode from '../models/series-episode.model';

export const getSeriesEpisodeByKey = (state: StateModel, key: SeriesEpisode['key']): SeriesEpisode => state.seriesEpisodes[key];

export const getSeriesEpisodesForSeason = (state: StateModel, seasonKey: SeriesEpisode['seasonKey']): SeriesEpisode[] => {
    console.log(seasonKey);
    const test = Object.values(state.seriesEpisodes).filter(episode => episode.seasonKey === seasonKey);
    console.log(test);
    return test;
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


const getEpisodeWithOffset = (state: StateModel, episodeKey: SeriesEpisode['key'], offset: number): SeriesEpisode => {
    const episode = getSeriesEpisodeByKey(state, episodeKey);

    if (!episode) {
        console.error('[Series Episode Selector => hasSeriesEpisodeNextEpisode] season or episode not found');
        return null;
    }

    const seasonEpisodes = getSeriesEpisodesForSeason(state, episode.seasonKey);

    return seasonEpisodes.find(seaspmEpisode => seaspmEpisode.episodeNumber === (episode.episodeNumber + offset));
};
