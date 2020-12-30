import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppControlStateModel } from '../models/app-control-state.model';
import { Series } from '../models/series.model';
import { SeriesSeason } from '../models/series-season.model';
import { deleteSeriesAction } from '../actions/shared.actions';
import { StateModel } from '../models/state.model';
import { NamedCollection } from '../models/collection.model';
import { SeriesMetaInfo } from '../models/series-meta-info.model';
import { CollectionType } from '../enums/collection-key.enum';

const initialState: AppControlStateModel = {
    seriesCollections: {},
    mutePreviewVideo: true,
    searchText: '',
};

function toggleSelectedSeries(state: AppControlStateModel, seriesKey: Series['key']) {
    const isDifferent = state.selectedSeriesKey !== seriesKey;
    state.selectedSeriesKey = isDifferent ? seriesKey : null;
    state.selectedSeason = null;
}

function setSelectedSeason(state: AppControlStateModel, seasonKey: SeriesSeason['key']) {
    state.selectedSeason = seasonKey;
}

function addOrReplaceMultipleSeriesCollection(state: AppControlStateModel,
                                              { collections }: { collections: NamedCollection<SeriesMetaInfo>[] }) {
    collections.forEach(collection => addOrReplaceSeriesCollection(state, { collection }));
}

function addOrReplaceSeriesCollection(state: AppControlStateModel,
                                      { collection }: { collection: NamedCollection<SeriesMetaInfo> }) {
    state.seriesCollections = {
        ...state.seriesCollections,
        [collection.key]: collection,
    };
}

function setSelectedSeries(state: AppControlStateModel,
                           { selectedSeriesKey }: { selectedSeriesKey: Series['key'] }): void {
    state.selectedSeriesKey = selectedSeriesKey;
    delete state.seriesCollections[CollectionType.SIMILAR_SERIES_MODAL];
}

function toggleMutePreviewVideoState(state: AppControlStateModel): void {
    state.mutePreviewVideo = !state.mutePreviewVideo;
}

function setSearchText(state: AppControlStateModel, payload: { searchText: string }) {
    state.searchText = payload.searchText;
}

function removeSeriesCollection(state: AppControlStateModel,
                                { collectionKey }: { collectionKey: NamedCollection<SeriesMetaInfo>['key'] }) {
    delete state.seriesCollections[collectionKey];
}

/* eslint-disable max-len */
export const appControlStateSlice = createSlice({
    name: 'appControlState',
    initialState,
    reducers: {
        setSelectedSeriesAction: (state: AppControlStateModel, action: PayloadAction<{ selectedSeriesKey: Series['key'] }>) => setSelectedSeries(state, action.payload),
        setSelectedSeasonForAppAction: (state: AppControlStateModel, action: PayloadAction<SeriesSeason['key']>) => setSelectedSeason(state, action.payload),
        removeSeriesCollectionAction: (state: AppControlStateModel, action: PayloadAction<{ collectionKey: NamedCollection<SeriesMetaInfo>['key'] }>) => removeSeriesCollection(state, action.payload),
        addOrReplaceSeriesCollectionAction: (state: AppControlStateModel, action: PayloadAction<{ collection: NamedCollection<SeriesMetaInfo> }>) => addOrReplaceSeriesCollection(state, action.payload),
        addOrReplaceMultipleSeriesCollectionAction: (state: AppControlStateModel, action: PayloadAction<{ collections: NamedCollection<SeriesMetaInfo>[] }>) => addOrReplaceMultipleSeriesCollection(state, action.payload),
        toggleMutePreviewVideoStateAction: (state: AppControlStateModel) => toggleMutePreviewVideoState(state),
        setSearchTextAction: (state: AppControlStateModel, action: PayloadAction<{ searchText: string }>) => setSearchText(state, action.payload),
    },
    extraReducers: (builder) => {
        builder.addCase(deleteSeriesAction, (state: StateModel['appControlState']) => toggleSelectedSeries(state, null));
    },
});
/* eslint-enable max-len */

export const {
    setSelectedSeasonForAppAction,
    addOrReplaceSeriesCollectionAction,
    removeSeriesCollectionAction,
    addOrReplaceMultipleSeriesCollectionAction,
    setSelectedSeriesAction,
    toggleMutePreviewVideoStateAction,
    setSearchTextAction,
} = appControlStateSlice.actions;
