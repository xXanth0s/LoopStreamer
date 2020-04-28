import {StateModel} from '../models/state.model';
import Series from '../models/series.model';
import SeriesEpisodeInfo from '../models/series-episode-info.model';

export const getAllSeries = (state: StateModel): Series[] => Object.values(state.series);

export const getSeriesByKey = (state: StateModel, seriesKey: Series['key']): Series => state.series[seriesKey];

export const getLastWatchedEpisode = (state: StateModel): SeriesEpisodeInfo | undefined => {
    const series = state.series[state.lastWatchedSeries];
    return series ? series.lastEpisodeWatched : undefined;
};
