import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AppControlStateModel from '../models/app-control-state.model';
import { PORTALS } from '../enums/portals.enum';
import Series from '../models/series.model';
import { SeriesSeason } from '../models/series-season.model';
import { deleteSeriesAction } from '../actions/shared.actions';
import { StateModel } from '../models/state.model';

const initialState: AppControlStateModel = {};


function setActivePortal(state: AppControlStateModel, payload: PORTALS): void {
    state.activePortal = payload;
}

function toggleSelectedSeries(state: AppControlStateModel, seriesKey: Series['key']) {
    const isDifferent = state.selectedSeries !== seriesKey;
    state.selectedSeries = isDifferent ? seriesKey : null;
}

function setSelectedSeason(state: AppControlStateModel, seasonKey: SeriesSeason['key']) {
    state.selectedSeason = seasonKey;
}

export const appControlStateSlice = createSlice({
    name: 'appControlState',
    initialState,
    reducers: {
        setActivePortalForAppAction: (state: AppControlStateModel, action: PayloadAction<PORTALS>) =>
            setActivePortal(state, action.payload),
        toggleSelectedSeriesForAppAction: (state: AppControlStateModel, action: PayloadAction<Series['key']>) =>
            toggleSelectedSeries(state, action.payload),
        setSelectedSeasonForAppAction: (state: AppControlStateModel, action: PayloadAction<SeriesSeason['key']>) =>
            setSelectedSeason(state, action.payload),
    }, extraReducers: (builder) => {
        builder.addCase(deleteSeriesAction, (state: StateModel['controlState']) =>
            toggleSelectedSeries(state, null));
    }
});

export const {
    setActivePortalForAppAction,
    toggleSelectedSeriesForAppAction,
    setSelectedSeasonForAppAction,
} = appControlStateSlice.actions;
