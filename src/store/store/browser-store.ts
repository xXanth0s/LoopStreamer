import { StateModel } from '../models/state.model';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { controlStateSlice } from '../reducers/control-state.reducer';
import { optionsSlice } from '../reducers/options.reducer';
import { providorsReducer } from '../reducers/providors.reducer';
import lastWatchedSeriesSlice from '../reducers/lastWatchedSeries.reducer';
import seriesSlice from '../reducers/series.reducer';
import portalsSlice from '../reducers/portals.reducer';
import { forwardToMainWithParams, getInitialStateRenderer, replayActionRenderer, } from 'electron-redux';
import seriesSeasonsReducer from '../reducers/series-season.reducer';
import seriesEpisodesReducer from '../reducers/series-episode.reducer';
import { environment } from '../../environments/environment';

const initialState = getInitialStateRenderer();

const browserStore = configureStore<StateModel>({
    reducer: {
        controlState: controlStateSlice.reducer,
        options: optionsSlice.reducer,
        providors: providorsReducer.reducer,
        lastWatchedSeries: lastWatchedSeriesSlice.reducer,
        series: seriesSlice.reducer,
        portals: portalsSlice.reducer,
        seriesSeasons: seriesSeasonsReducer.reducer,
        seriesEpisodes: seriesEpisodesReducer.reducer,
    },
    preloadedState: initialState,
    // @ts-ignore
    middleware: [
        ...getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }),
        forwardToMainWithParams(),
    ],
    devTools: environment.isDev,
});

export const initBrowserStore = () => {
    replayActionRenderer(browserStore);

}

export default browserStore;
