import { StateModel } from '../models/state.model';
import Series from '../models/series.model';

export const getWatchedSeries = (state: StateModel): Series['key'][] => state.watchedSeries;
