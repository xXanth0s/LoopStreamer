import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Series from '../models/series.model';


const initialState: Series['key'] = 'family-guy';

const setLastWatchedEpisode = function (state: Series['key'], series: Series['key']): Series['key'] {
    return series
};

const lastWatchedSeriesSlice = createSlice({
    name: 'lastWatchedSeries',
    initialState,
    reducers: {
        setLastWatchedSeriesAction : (state: Series['key'], action: PayloadAction<Series['key']>) => setLastWatchedEpisode(state, action.payload),
    },
});


export const {setLastWatchedSeriesAction} = lastWatchedSeriesSlice.actions;

export default lastWatchedSeriesSlice;



