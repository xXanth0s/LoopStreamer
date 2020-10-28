import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateModel } from '../models/state.model';
import { SeriesSeason } from '../models/series-season.model';
import Series from '../models/series.model';
import { filterObject } from '../utils/selector.utils';
import { deleteSeriesAction } from '../actions/shared.actions';


const initialState: StateModel['seriesSeasons'] = {};

const updateOrAddSeriesSeason = function (state: StateModel['seriesSeasons'], seriesSeason: SeriesSeason): void {

    const oldSeasonObject = state[seriesSeason.key];

    state[seriesSeason.key] = {
        ...oldSeasonObject,
        ...seriesSeason,
        portalLinks: {
            ...oldSeasonObject?.portalLinks,
            ...seriesSeason.portalLinks,
        }
    };
};

const updateOrAddMultipleSeriesSeason = function (state: StateModel['seriesSeasons'], seriesSeasons: SeriesSeason[]): void {
    seriesSeasons.forEach(season => updateOrAddSeriesSeason(state, season));
};

function deleteAllSeasonsForSeries(state: StateModel['seriesSeasons'], seriesKey: string): StateModel['seriesSeasons'] {
    return filterObject(state, season => season.seriesKey !== seriesKey);
}

const seriesSeasonsReducer = createSlice({
    name: 'seriesSeasons',
    initialState,
    reducers: {
        updateOrAddSeriesSeasonAction: (state: StateModel['seriesSeasons'], action: PayloadAction<SeriesSeason>) => updateOrAddSeriesSeason(state, action.payload),
        updateOrAddMutlipleSeriesSeasonAction: (state: StateModel['seriesSeasons'], action: PayloadAction<SeriesSeason[]>) => updateOrAddMultipleSeriesSeason(state, action.payload),
    }, extraReducers: (builder) => {
        builder.addCase(deleteSeriesAction, (state: StateModel['seriesSeasons'], action: PayloadAction<Series['key']>) =>
            deleteAllSeasonsForSeries(state, action.payload));
    }
});

export const {
    updateOrAddSeriesSeasonAction,
    updateOrAddMutlipleSeriesSeasonAction
} = seriesSeasonsReducer.actions;


export default seriesSeasonsReducer;
