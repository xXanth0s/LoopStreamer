import { configureStore } from '@reduxjs/toolkit';
import seriesSlice from '../reducers/series.reducer';
import portalsSlice from '../reducers/portals.reducer';
import { optionsSlice } from '../reducers/options.reducer';
import { StateModel } from '../models/state.model';
import { controlStateSlice } from '../reducers/control-state.reducer';
import createSagaMiddleware from 'redux-saga';
// @ts-ignore
import { forwardToRenderer, replayActionMain, triggerAlias } from 'electron-redux';
import seriesSeasonsReducer from '../reducers/series-season.reducer';
import seriesEpisodesReducer from '../reducers/series-episode.reducer';
import { getStorageData, StorageMiddlerware } from '../middleware/storage.middlerware';
import { appControlStateSlice } from '../reducers/app-control-state.reducer';
import { watcherSaga } from '../saga/watcher.saga';
import linkSlice from '../reducers/link.reducer';
import { providorsSlice } from '../reducers/providors.reducer';

const preloadedState = getStorageData();
const sagaMiddleware = createSagaMiddleware();
const middleware = [
    triggerAlias,
    sagaMiddleware,
    StorageMiddlerware,
    forwardToRenderer
]

const backgroundStore = configureStore<StateModel>({
    reducer: {
        controlState: controlStateSlice.reducer,
        appControlState: appControlStateSlice.reducer,
        options: optionsSlice.reducer,
        providors: providorsSlice.reducer,
        series: seriesSlice.reducer,
        portals: portalsSlice.reducer,
        seriesSeasons: seriesSeasonsReducer.reducer,
        seriesEpisodes: seriesEpisodesReducer.reducer,
        links: linkSlice.reducer
    },
    // @ts-ignore
    middleware,
    preloadedState
});

console.log('background store loaded ')

sagaMiddleware.run(watcherSaga);

replayActionMain(backgroundStore);

export default backgroundStore;
