import {configureStore} from '@reduxjs/toolkit';
import lastWatchedSeriesSlice, {setLastWatchedSeriesAction} from '../reducers/lastWatchedSeries.reducer';
import seriesSlice, {initSeriesAction} from '../reducers/series.reducer';
import portalsSlice, {updatePortalsAction} from '../reducers/portals.reducer';
import {optionsSlice, updateOptionsAction} from '../reducers/options.reducer';
import {StateModel} from '../models/state.model';
import {providorsReducer, updateProvidorsAction} from '../reducers/providors.reducer';
import {BrowserStorageMiddlerware} from '../middleware/browser-storage.middleware';
import {browser} from 'webextension-polyfill-ts';
import {controlStateSlice} from '../reducers/control-state.reducer';
// @ts-ignore
import {composeWithDevTools} from 'remote-redux-devtools';
import { forwardToRenderer, triggerAlias, replayActionMain } from 'electron-redux';

// const composeEnhancers = composeWithDevTools({ realtime: true,  hostname: 'localhost', port: 8000 });

const backgroundStore = configureStore<StateModel>({
    reducer: {
        controlState: controlStateSlice.reducer,
        options: optionsSlice.reducer,
        providors: providorsReducer.reducer,
        lastWatchedSeries: lastWatchedSeriesSlice.reducer,
        series: seriesSlice.reducer,
        portals: portalsSlice.reducer
    },
    // @ts-ignore
    middleware: [
        triggerAlias,
        forwardToRenderer
    ],
    devTools: true,
    // enhancers: [
    //     composeEnhancers.apply(BrowserStorageMiddlerware)
    // ]
});


replayActionMain(backgroundStore);

export const initStore = async function(): Promise<void> {

    replayActionMain(backgroundStore);
    // const chromeStorage: StateModel = (await browser.storage.local.get()) as StateModel;
    // if(Object.entries(chromeStorage).length) {
    //     backgroundStore.dispatch(updateOptionsAction(chromeStorage.options));
    //     backgroundStore.dispatch(updateProvidorsAction(Object.values(chromeStorage.providors)));
    //     backgroundStore.dispatch(setLastWatchedSeriesAction(chromeStorage.lastWatchedSeries));
    //     backgroundStore.dispatch(initSeriesAction(Object.values(chromeStorage.series)));
    //     backgroundStore.dispatch(updatePortalsAction(Object.values(chromeStorage.portals)));
    // }
    return;
};

export default backgroundStore;
