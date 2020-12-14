import { StateModel } from '../models/state.model';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SeriesMetaInfo } from '../models/series-meta-info.model';

const initialState: StateModel['seriesMetaInfos'] = {};

function addSeriesMetaInfo(state: StateModel['seriesMetaInfos'], { seriesMetaInfo }: { seriesMetaInfo: SeriesMetaInfo }): void {
    state[seriesMetaInfo.key] = seriesMetaInfo;
}

function addMultipleSeriesMetaInfos(state: StateModel['seriesMetaInfos'], { seriesMetaInfos }: { seriesMetaInfos: SeriesMetaInfo[] }): void {
    seriesMetaInfos.forEach(seriesMetaInfo => addSeriesMetaInfo(state, { seriesMetaInfo }));
}

const { reducer, actions } = createSlice({
    name: 'genres',
    initialState,
    reducers: {
        addSeriesMetaInfoAction: (state: StateModel['seriesMetaInfos'], action: PayloadAction<{ seriesMetaInfo: SeriesMetaInfo }>) =>
            addSeriesMetaInfo(state, action.payload),
        addMultipleSeriesMetaInfosAction: (state: StateModel['seriesMetaInfos'], action: PayloadAction<{ seriesMetaInfos: SeriesMetaInfo[] }>) =>
            addMultipleSeriesMetaInfos(state, action.payload),
    }
});

export const {
    addSeriesMetaInfoAction,
    addMultipleSeriesMetaInfosAction
} = actions;

export const seriesMetaInfoReducer = reducer;
