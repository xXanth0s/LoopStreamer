import { StateModel } from '../models/state.model';
import Series from '../models/series.model';

export const getExpandedSeries = (state: StateModel): Series['key'] => state.appControlState.selectedSeries;

export const isSeriesExpandedOnApp = (state: StateModel, seriesKey: Series['key']): boolean => {
    return state.appControlState.selectedSeries === seriesKey;
};
export const isAnySeriesExpandedOnApp = (state: StateModel, seriesKeys: Series['key'][]): boolean => {
    return seriesKeys.some(key => key === state.appControlState.selectedSeries);
};
