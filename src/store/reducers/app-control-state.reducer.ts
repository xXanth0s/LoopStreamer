import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AppControlStateModel from '../models/app-control-state.model';
import { PORTALS } from '../enums/portals.enum';
import Series from '../models/series.model';
import { SeriesSeason } from '../models/series-season.model';
import { deleteSeriesAction } from '../actions/shared.actions';
import { StateModel } from '../models/state.model';
import { LANGUAGE } from '../enums/language.enum';

const initialState: AppControlStateModel = {};


function setActivePortal(state: AppControlStateModel, payload: PORTALS): void {
    state.activePortal = payload;
}

function toggleSelectedSeries(state: AppControlStateModel, seriesKey: Series['key']) {
    const isDifferent = state.selectedSeriesKey !== seriesKey;
    state.selectedSeriesKey = isDifferent ? seriesKey : null;
}

function setSelectedSeason(state: AppControlStateModel, seasonKey: SeriesSeason['key']) {
    state.selectedSeason = seasonKey;
}

function setSelectedLanguage(state: AppControlStateModel, { selectedLanguage }: { selectedLanguage: LANGUAGE }): void {
    state.selectedLanguage = selectedLanguage;
}

function reset(): AppControlStateModel {
    return {
        selectedSeason: null,
        activePortal: null,
        selectedSeriesKey: null,
        selectedLanguage: LANGUAGE.NONE,
    };
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
        setSelectedLanguageAction: (state: AppControlStateModel, action: PayloadAction<{ selectedLanguage: LANGUAGE }>) =>
            setSelectedLanguage(state, action.payload),
        resetAppControlStateAction: (state: AppControlStateModel) =>
            reset(),
    }, extraReducers: (builder) => {
        builder.addCase(deleteSeriesAction, (state: StateModel['controlState']) =>
            toggleSelectedSeries(state, null));
    }
});

export const {
    setActivePortalForAppAction,
    toggleSelectedSeriesForAppAction,
    setSelectedSeasonForAppAction,
    setSelectedLanguageAction,
    resetAppControlStateAction,
} = appControlStateSlice.actions;
