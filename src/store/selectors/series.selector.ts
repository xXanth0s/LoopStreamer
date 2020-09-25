import { StateModel } from '../models/state.model';
import Series from '../models/series.model';

export const getAllSeries = (state: StateModel): Series[] => Object.values(state.series);

export const getSeriesByKey = (state: StateModel, seriesKey: Series['key']): Series => state.series[seriesKey];
