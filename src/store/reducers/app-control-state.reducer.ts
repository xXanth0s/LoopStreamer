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
import { CollectionType } from '../enums/collection-key.enum';

const initialState: AppControlStateModel = {
    seriesCollections: {},
    mutePreviewVideo: true,
    searchText: '',
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

function reset(state: AppControlStateModel): AppControlStateModel {
    return {
        ...state,
        selectedSeason: null,
        activePortal: null,
        selectedSeriesKey: null,
        selectedLanguage: LANGUAGE.NONE,
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

function setSelectedSeries(state: AppControlStateModel, {selectedSeriesKey}: { selectedSeriesKey: Series['key'] }): void {
    state.selectedSeriesKey = selectedSeriesKey;
    delete state.seriesCollections[CollectionType.SIMILAR_SERIES_MODAL];
}

function toggleMutePreviewVideoState(state: AppControlStateModel): void {
    state.mutePreviewVideo = !state.mutePreviewVideo;
}

function setSearchText(state: AppControlStateModel, payload: { searchText: string }) {
    state.searchText = payload.searchText;
}

function removeSeriesCollection(state: AppControlStateModel, { collectionKey }: { collectionKey: NamedCollection<SeriesMetaInfo>['key'] }) {
    delete state.seriesCollections[collectionKey];
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
        removeSeriesCollectionAction: (state: AppControlStateModel, action: PayloadAction<{ collectionKey: NamedCollection<SeriesMetaInfo>['key'] }>) =>
            removeSeriesCollection(state, action.payload),
        addOrReplaceSeriesCollectionAction: (state: AppControlStateModel, action: PayloadAction<{ collection: NamedCollection<SeriesMetaInfo> }>) =>
            addOrReplaceSeriesCollection(state, action.payload),
        addOrReplaceMultipleSeriesCollectionAction: (state: AppControlStateModel, action: PayloadAction<{ collections: NamedCollection<SeriesMetaInfo>[] }>) =>
            addOrReplaceMultipleSeriesCollection(state, action.payload),
        toggleMutePreviewVideoStateAction: (state: AppControlStateModel) => toggleMutePreviewVideoState(state),
        resetAppControlStateAction: (state: AppControlStateModel) => reset(state),
        setSearchTextAction: (state: AppControlStateModel, action: PayloadAction<{ searchText: string }>) => setSearchText(state, action.payload)
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
    removeSeriesCollectionAction,
    addOrReplaceMultipleSeriesCollectionAction,
    setSelectedSeriesAction,
    toggleMutePreviewVideoStateAction,
    setSearchTextAction
} = appControlStateSlice.actions;
