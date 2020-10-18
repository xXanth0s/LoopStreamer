import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Series from '../models/series.model';
import { StateModel } from '../models/state.model';
import { seriesEpisodeStartedAction } from './series-episode.reducer';
import SeriesEpisode from '../models/series-episode.model';

const initialState: StateModel['series'] = {};

const removeSeries = (state: { [key: string]: Series }, key: Series['key']): { [key: string]: Series } => {
    delete state[key];
    return state;
};

const resetSeries = (state: { [key: string]: Series }, key: Series['key']): { [key: string]: Series } => {
    const series = state[key];
    state[key] = {
        ...series,
        isEndTimeConfigured: false,
        lastEpisodeWatched: undefined,
        isStartTimeConfigured: false,
        scipEndTime: 0,
        scipStartTime: 0
    };
    return state;
};

const setStartTimeForSeries = (state: { [key: string]: Series }, key: Series['key'], scipStartTime?: Series['scipStartTime']): { [key: string]: Series } => {
    const series = state[key];
    state[key] = {
        ...series,
        isStartTimeConfigured: true,
        scipStartTime: Math.trunc(scipStartTime),
    };
    return state;
};

const setEndTimeForSeries = (state: { [key: string]: Series }, key: Series['key'], scipEndTime?: Series['scipStartTime']): { [key: string]: Series } => {
    const series = state[key];
    state[key] = {
        ...series,
        isEndTimeConfigured: true,
        scipEndTime: Math.trunc(scipEndTime),
    };
    return state;
};

function updateOrAddSeries(state: { [key: string]: Series }, seriesInfo: Series): void {
    const { key, portalLinks } = seriesInfo;

    state[key] = {
        ...state[key],
        ...seriesInfo,
        portalLinks: {
            ...state[key]?.portalLinks,
            ...portalLinks,
        }
    };
}

function updateOrAddMultipleSeries(state: { [key: string]: Series }, seriesInfos: Series[]): void {
    for (const series of seriesInfos) {
        updateOrAddSeries(state, series);
    }
}

function seriesStarted(state: StateModel['series'], actionData: { seriesKey: Series['key'], seriesEpisodeKey: SeriesEpisode['key']; duration: SeriesEpisode['duration'] }): void {
    const { seriesEpisodeKey, seriesKey } = actionData;
    if (!state[seriesKey]) {
        console.error(`[SeriesReducer->seriesStarted] tried to update series ${seriesKey} but no series found`);
        return;
    }

    state[seriesKey].lastEpisodeWatched = seriesEpisodeKey;
}

const seriesSlice = createSlice({
    name: 'series',
    initialState,
    reducers: {
        removeSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<Series['key']>) =>
            removeSeries(state, action.payload),
        setStartTimeForSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<{ key: Series['key'], scipStartTime?: Series['scipStartTime'] }>) =>
            setStartTimeForSeries(state, action.payload.key, action.payload.scipStartTime),
        setEndTimeForSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<{ key: Series['key'], scipEndTime?: Series['scipStartTime'] }>) =>
            setEndTimeForSeries(state, action.payload.key, action.payload.scipEndTime),
        resetSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<Series['key']>) =>
            resetSeries(state, action.payload),
        updateOrAddSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<Series>) =>
            updateOrAddSeries(state, action.payload),
        updateOrAddMultipleSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<Series[]>) =>
            updateOrAddMultipleSeries(state, action.payload),
    }, extraReducers: (builder) => {
        builder.addCase(seriesEpisodeStartedAction, (state: StateModel['series'], action: PayloadAction<{ seriesKey: Series['key'], seriesEpisodeKey: SeriesEpisode['key'], duration: SeriesEpisode['duration'] }>) =>
            seriesStarted(state, action.payload));
    },
});

export const {
    removeSeriesAction,
    resetSeriesAction,
    setStartTimeForSeriesAction,
    setEndTimeForSeriesAction,
    updateOrAddSeriesAction,
    updateOrAddMultipleSeriesAction
} = seriesSlice.actions;

export default seriesSlice;
