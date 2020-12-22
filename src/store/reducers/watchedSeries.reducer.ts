import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateModel } from '../models/state.model';
import Series from '../models/series.model';
import { removeDuplicatesFromArray } from '../../utils/array.utils';

const initialPortalsData: StateModel['watchedSeries'] = [];

function addWatchedSeries(state: Series['key'][], payload: { seriesKey: Series['key'] }): Series['key'][] {
    const allSeries = [
        payload.seriesKey,
        ...state
    ];

    return removeDuplicatesFromArray(allSeries);
}

const { reducer, actions } = createSlice({
    name: 'watchedSeries',
    initialState: initialPortalsData,
    reducers: {
        addWatchedSeriesAction: (state: StateModel['watchedSeries'], action: PayloadAction<{ seriesKey: Series['key'] }>) => addWatchedSeries(state, action.payload),
    },
});

export const { addWatchedSeriesAction } = actions;

export const watchedSeriesReducer = reducer;
