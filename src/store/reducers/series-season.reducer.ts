import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateModel } from '../models/state.model';
import { SeriesSeason } from '../models/series-season.model';


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

const seriesSeasonsReducer = createSlice({
    name: 'seriesSeasons',
    initialState,
    reducers: {
        updateOrAddSeriesSeasonAction: (state: StateModel['seriesSeasons'], action: PayloadAction<SeriesSeason>) => updateOrAddSeriesSeason(state, action.payload),
        updateOrAddMutlipleSeriesSeasonAction: (state: StateModel['seriesSeasons'], action: PayloadAction<SeriesSeason[]>) => updateOrAddMultipleSeriesSeason(state, action.payload),
    },
});

export const {
    updateOrAddSeriesSeasonAction,
    updateOrAddMutlipleSeriesSeasonAction
} = seriesSeasonsReducer.actions;


export default seriesSeasonsReducer;
