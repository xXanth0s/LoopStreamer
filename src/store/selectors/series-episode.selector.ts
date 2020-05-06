import { StateModel } from '../models/state.model';
import SeriesEpisode from '../models/series-episode.model';

export const getSeriesEpisodeByKey = (state: StateModel, key: SeriesEpisode['key']): SeriesEpisode => state.seriesEpisodes[key];
