import { configureStore } from '@reduxjs/toolkit';
import { forwardToMainWithParams, getInitialStateRenderer, replayActionRenderer } from 'electron-redux';
import { environment } from '../../environments/environment';
import { StateModel } from '../models/state.model';
import { storeReducers } from '../reducers/reducer.collection';

const initialState = getInitialStateRenderer();

const browserStore = configureStore<StateModel>({
    reducer: storeReducers,
    preloadedState: initialState,
    // @ts-ignore
    middleware: [
        forwardToMainWithParams(),
    ],
    devTools: environment.isDev,
});

replayActionRenderer(browserStore);

export default browserStore;
