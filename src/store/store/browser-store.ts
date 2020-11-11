import { StateModel } from '../models/state.model';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { controlStateSlice } from '../reducers/control-state.reducer';
import { optionsSlice } from '../reducers/options.reducer';
import { providorsReducer } from '../reducers/providors.reducer';
import seriesSlice from '../reducers/series.reducer';
import portalsSlice from '../reducers/portals.reducer';
import { forwardToMainWithParams, getInitialStateRenderer, replayActionRenderer, } from 'electron-redux';
import seriesSeasonsReducer from '../reducers/series-season.reducer';
import seriesEpisodesReducer from '../reducers/series-episode.reducer';
import { environment } from '../../environments/environment';
import { appControlStateSlice } from '../reducers/app-control-state.reducer';
import linkSlice from '../reducers/link.reducer';

const initialState = getInitialStateRenderer();

const browserStore = configureStore<StateModel>({
    reducer: {
        controlState: controlStateSlice.reducer,
        appControlState: appControlStateSlice.reducer,
        options: optionsSlice.reducer,
        providors: providorsReducer.reducer,
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
export const initBrowserStore = () => {

}

export default browserStore;
