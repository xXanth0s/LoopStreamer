import { StateModel } from '../models/state.model';
import SeriesEpisode from '../models/series-episode.model';
import { getSeriesSeasonForEpisode } from './series-season.selector';

export const getSeriesEpisodeByKey = (state: StateModel, key: SeriesEpisode['key']): SeriesEpisode => state.seriesEpisodes[key];

export const getSeriesEpisodesByKeys = (state: StateModel, keys: SeriesEpisode['key'][]): SeriesEpisode[] => keys.map(key => getSeriesEpisodeByKey(state, key));

export const hasSeriesEpisodeNextEpisode = (state: StateModel, key: SeriesEpisode['key']): boolean => {
    const episode = getSeriesEpisodeByKey(state, key);
    const seriesSeason = getSeriesSeasonForEpisode(state, key);

    if(!seriesSeason || !episode) {
        console.error('[Series Episode Selector => hasSeriesEpisodeNextEpisode] season or episode not found')
        return false
    }

    const seasonEpisodes = getSeriesEpisodesByKeys(state, seriesSeason.episodes)

    return seasonEpisodes.some(seaspmEpisode => seaspmEpisode.episodeNumber === (episode.episodeNumber + 1))
}

export const hasSeriesEpisodePreviousEpisode = (state: StateModel, key: SeriesEpisode['key']): boolean => {
    const episode = getSeriesEpisodeByKey(state, key);
    const seriesSeason = getSeriesSeasonForEpisode(state, key);

    if(!seriesSeason || !episode) {
        console.error('[Series Episode Selector => hasSeriesEpisodeNextEpisode] season or episode not found')
        return false
    }

    const seasonEpisodes = getSeriesEpisodesByKeys(state, seriesSeason.episodes)

    return seasonEpisodes.some(seaspmEpisode => seaspmEpisode.episodeNumber === (episode.episodeNumber - 1))
}
