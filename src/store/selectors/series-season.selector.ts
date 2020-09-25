import { StateModel } from '../models/state.model';
import SeriesEpisode from '../models/series-episode.model';
import { SeriesSeason } from '../models/series-season.model';

export const getSeriesSeasonByKey = (state: StateModel, key: SeriesEpisode['key']): SeriesSeason => state.seriesSeasons[key];

export const getSeriesSeasonsByKeys = (state: StateModel, keys: SeriesEpisode['key'][]): SeriesSeason[] => keys.map(key => getSeriesSeasonByKey(state, key));
