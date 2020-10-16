import { StateModel } from '../models/state.model';
import Series from '../models/series.model';
import { PORTALS } from '../enums/portals.enum';

export const getAllSeries = (state: StateModel): Series[] => Object.values(state.series);

export const getAllWatchedSeries = (state: StateModel): Series[] => Object.values(state.series).filter(series => series.lastEpisodeWatched);

export const getSeriesByKey = (state: StateModel, seriesKey: Series['key']): Series => state.series[seriesKey];

export const getSeriesForPortal = (state: StateModel, portal: PORTALS): Series[] => {
    return Object.values(state.series).filter(series => {
        return Object.keys(series.portalLinks).some(availablePortal => availablePortal === portal);
    });
};
