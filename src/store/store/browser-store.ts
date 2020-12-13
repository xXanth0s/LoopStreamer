import { configureStore } from '@reduxjs/toolkit';
import { forwardToMainWithParams, getInitialStateRenderer, replayActionRenderer } from 'electron-redux';
import { controlStateSlice } from '../reducers/control-state.reducer';
import { optionsSlice } from '../reducers/options.reducer';
import seriesSlice from '../reducers/series.reducer';
import portalsSlice from '../reducers/portals.reducer';
import seriesSeasonsReducer from '../reducers/series-season.reducer';
import seriesEpisodesReducer from '../reducers/series-episode.reducer';
import { environment } from '../../environments/environment';
import { appControlStateSlice } from '../reducers/app-control-state.reducer';
import linkSlice from '../reducers/link.reducer';
import { providorsSlice } from '../reducers/providors.reducer';
import { StateModel } from '../models/state.model';

const initialState = getInitialStateRenderer();

const browserStore = configureStore<StateModel>({
    reducer: {
        controlState: controlStateSlice.reducer,
        appControlState: appControlStateSlice.reducer,
        options: optionsSlice.reducer,
        providors: providorsSlice.reducer,
        series: seriesSlice.reducer,
        portals: portalsSlice.reducer,
        seriesSeasons: seriesSeasonsReducer.reducer,
        seriesEpisodes: seriesEpisodesReducer.reducer,
        links: linkSlice.reducer,
    },
    preloadedState: initialState,
    // @ts-ignore
    middleware: [
        forwardToMainWithParams(),
    ],
    devTools: environment.isDev,
});

replayActionRenderer(browserStore);

export default browserStore;
