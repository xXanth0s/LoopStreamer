import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AppControlStateModel from '../models/app-control-state.model';
import { PORTALS } from '../enums/portals.enum';
import Series from '../models/series.model';
import { SeriesSeason } from '../models/series-season.model';
import { deleteSeriesAction, userChangedLanguageAction } from '../actions/shared.actions';
import { StateModel } from '../models/state.model';
import { LANGUAGE } from '../enums/language.enum';
import { NamedCollection } from '../models/collection.model';
import { SeriesMetaInfo } from '../models/series-meta-info.model';

const initialState: AppControlStateModel = {
    seriesCollections: {},
    mutePreviewVideo: true
};

function setActivePortal(state: AppControlStateModel, payload: PORTALS): void {
    state.activePortal = payload;
}

function toggleSelectedSeries(state: AppControlStateModel, seriesKey: Series['key']) {
    const isDifferent = state.selectedSeriesKey !== seriesKey;
    state.selectedSeriesKey = isDifferent ? seriesKey : null;
    state.selectedSeason = null;
    state.selectedLanguage = LANGUAGE.NONE;
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
        seriesCollections: {},
        mutePreviewVideo: false,
    };
}

function addOrReplaceMultipleSeriesCollection(state: AppControlStateModel, { collections }: { collections: NamedCollection<SeriesMetaInfo>[] }) {
    collections.forEach(collection => addOrReplaceSeriesCollection(state, { collection }));
}

function addOrReplaceSeriesCollection(state: AppControlStateModel, { collection }: { collection: NamedCollection<SeriesMetaInfo> }) {
    state.seriesCollections = {
        ...state.seriesCollections,
        [collection.key]: collection,
    };
}

function setSelectedSeries(state: AppControlStateModel, { selectedSeriesKey }: { selectedSeriesKey: Series['key'] }): void {
    state.selectedSeriesKey = selectedSeriesKey;
}

function toggleMutePreviewVideoState(state: AppControlStateModel): void {
    state.mutePreviewVideo = !state.mutePreviewVideo;
}

export const appControlStateSlice = createSlice({
    name: 'appControlState',
    initialState,
    reducers: {
        setActivePortalForAppAction: (state: AppControlStateModel, action: PayloadAction<PORTALS>) => setActivePortal(state, action.payload),
        toggleSelectedSeriesForAppAction: (state: AppControlStateModel, action: PayloadAction<Series['key']>) => toggleSelectedSeries(state, action.payload),
        setSelectedSeriesAction: (state: AppControlStateModel, action: PayloadAction<{ selectedSeriesKey: Series['key'] }>) => setSelectedSeries(state, action.payload),
        setSelectedSeasonForAppAction: (state: AppControlStateModel, action: PayloadAction<SeriesSeason['key']>) => setSelectedSeason(state, action.payload),
        setSelectedLanguageAction: (state: AppControlStateModel, action: PayloadAction<{ selectedLanguage: LANGUAGE }>) => setSelectedLanguage(state, action.payload),
        addOrReplaceSeriesCollectionAction: (state: AppControlStateModel, action: PayloadAction<{ collection: NamedCollection<SeriesMetaInfo> }>) =>
            addOrReplaceSeriesCollection(state, action.payload),
        addOrReplaceMultipleSeriesCollectionAction: (state: AppControlStateModel, action: PayloadAction<{ collections: NamedCollection<SeriesMetaInfo>[] }>) =>
            addOrReplaceMultipleSeriesCollection(state, action.payload),
        toggleMutePreviewVideoStateAction: (state: AppControlStateModel) => toggleMutePreviewVideoState(state),
        resetAppControlStateAction: () => reset(),
    },
    extraReducers: (builder) => {
        builder.addCase(deleteSeriesAction, (state: StateModel['appControlState']) => toggleSelectedSeries(state, null));
        builder.addCase(userChangedLanguageAction, (state: StateModel['appControlState'], action: PayloadAction<{ selectedLanguage: LANGUAGE }>) => setSelectedLanguage(state, action.payload));
    },
});

export const {
    setActivePortalForAppAction,
    toggleSelectedSeriesForAppAction,
    setSelectedSeasonForAppAction,
    setSelectedLanguageAction,
    resetAppControlStateAction,
    addOrReplaceSeriesCollectionAction,
    addOrReplaceMultipleSeriesCollectionAction,
    setSelectedSeriesAction,
    toggleMutePreviewVideoStateAction
} = appControlStateSlice.actions;
