import { StateModel } from '../models/state.model';
import SeriesEpisode from '../models/series-episode.model';
import { SeriesSeason } from '../models/series-season.model';
import { getSeriesEpisodeByKey } from './series-episode.selector';
import { getKeyForSeriesSeason } from '../utils/key.utils';

export const getSeriesSeasonByKey = (state: StateModel, key: SeriesSeason['key']): SeriesSeason => state.seriesSeasons[key];

export const getSeriesSeasonsByKeys = (state: StateModel, keys: SeriesSeason['key'][]): SeriesSeason[] => keys.map(key => getSeriesSeasonByKey(state, key));

export const getSeriesSeasonForEpisode = (state: StateModel, seriesEpisodeKey: SeriesEpisode['key']): SeriesSeason => {
    const episode = getSeriesEpisodeByKey(state, seriesEpisodeKey);
    const seasonKey = getKeyForSeriesSeason(episode.seriesKey, episode.season);

    return getSeriesSeasonByKey(state, seasonKey)
}
