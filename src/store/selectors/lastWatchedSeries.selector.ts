import {StateModel} from '../models/state.model';
import Series from '../models/series.model';

export const getLastWatchedSeries = (state: StateModel): Series => state.series[state.lastWatchedSeries];
