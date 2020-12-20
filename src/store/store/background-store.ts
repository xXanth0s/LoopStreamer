import { applyMiddleware, configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { forwardToRenderer, replayActionMain, triggerAlias } from 'electron-redux';
import { StateModel } from '../models/state.model';
// @ts-ignore
import { getStorageData, StorageMiddlerware } from '../middleware/storage.middlerware';
import { sagaErrorHandler, watcherSaga } from '../saga/watcher.saga';
import { storeReducers } from '../reducers/reducer.collection';
import { composeWithDevTools } from 'remote-redux-devtools';

const preloadedState = getStorageData();
const sagaMiddleware = createSagaMiddleware({ onError: sagaErrorHandler });
const middleware = [
    triggerAlias,
    sagaMiddleware,
    StorageMiddlerware,
    forwardToRenderer,
];
const composeEnhancer = composeWithDevTools({ hostname: 'localhost', port: 8800 })(applyMiddleware(...middleware));

const backgroundStore = configureStore<StateModel>({
    reducer: storeReducers,
    // @ts-ignore
    preloadedState,
    enhancers: [ composeEnhancer ]
});

console.log('background store loaded ');

sagaMiddleware.run(watcherSaga);

replayActionMain(backgroundStore);

export default backgroundStore;
