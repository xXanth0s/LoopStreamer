import { StateModel } from '../models/state.model';
import Series from '../models/series.model';
import { PORTALS } from '../enums/portals.enum';

export const getExpandedSeries = (state: StateModel): Series['key'] => state.appControlState.selectedSeriesKey;

export const isSeriesExpandedOnApp = (state: StateModel, seriesKey: Series['key']): boolean => {
    return state.appControlState.selectedSeriesKey === seriesKey;
};

export const isAnySeriesExpandedOnApp = (state: StateModel, seriesKeys: Series['key'][]): boolean => {
    return seriesKeys.some(key => key === state.appControlState.selectedSeriesKey);
};

export const getActivePortalOnApp = (state: StateModel): PORTALS => state.appControlState.activePortal;
