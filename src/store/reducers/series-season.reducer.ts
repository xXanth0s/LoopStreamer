import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateModel } from '../models/state.model';
import { SeriesSeason } from '../models/series-season.model';


const initialState: StateModel['seriesSeasons'] = {};

const updateOrAddSeriesSeason = function (state: StateModel['seriesSeasons'], seriesSeason: SeriesSeason): StateModel['seriesSeasons'] {

    const oldSeasonObject = state[seriesSeason.key];

    return {
        ...state,
        [seriesSeason.key]: {
            ...oldSeasonObject,
            ...seriesSeason,
            portalLinks: {
                ...oldSeasonObject?.portalLinks,
                ...seriesSeason.portalLinks,
            }
        }
    };
};

const seriesSeasonsReducer = createSlice({
    name: 'seriesSeasons',
    initialState,
    reducers: {
        updateOrAddSeriesSeasonAction: (state: StateModel['seriesSeasons'], action: PayloadAction<SeriesSeason>) => updateOrAddSeriesSeason(state, action.payload),
    },
});

export const {
    updateOrAddSeriesSeasonAction
} = seriesSeasonsReducer.actions;


export default seriesSeasonsReducer;
