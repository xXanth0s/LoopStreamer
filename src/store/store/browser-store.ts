import { StateModel } from '../models/state.model';
import { configureStore } from '@reduxjs/toolkit';
import {
    contextBridge,
    ipcRenderer
} from "electron";
import { controlStateSlice } from '../reducers/control-state.reducer';
import { optionsSlice } from '../reducers/options.reducer';
import { providorsReducer } from '../reducers/providors.reducer';
import lastWatchedSeriesSlice from '../reducers/lastWatchedSeries.reducer';
import seriesSlice from '../reducers/series.reducer';
import portalsSlice from '../reducers/portals.reducer';
import {
    forwardToMainWithParams,
    replayActionRenderer,
    getInitialStateRenderer,
} from 'electron-redux';
import path  from 'path';
const __dirname = path.resolve();

console.log(process.env.NODE_ENV );
console.log(__dirname );
const initialState = getInitialStateRenderer();

const browserStore = configureStore<StateModel>({
    reducer: {
        controlState: controlStateSlice.reducer,
        options: optionsSlice.reducer,
        providors: providorsReducer.reducer,
        lastWatchedSeries: lastWatchedSeriesSlice.reducer,
        series: seriesSlice.reducer,
        portals: portalsSlice.reducer
    },
    preloadedState: initialState,
    middleware: [
        forwardToMainWithParams(),
    ],
    devTools: true,
});


replayActionRenderer(browserStore);

export default browserStore;
