import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import ElectronStore from 'electron-store';
import { StateModel } from '../models/state.model';

const store = new ElectronStore();
const stateKey = 'state';

export const StorageMiddlerware: Middleware = ({ getState }: MiddlewareAPI) => ((
    next: Dispatch
) => async action => {
    const returnValue = next(action);

    const state = {
        ...getState(),
    };
    delete state.controlState;
    try {
        store.set(stateKey, state);
    } catch (e) {
        console.error('BrowserStorageMiddlerware: data could not be saved to chrome local storage');
        console.error(e);
    }

    return returnValue;
});

export function getStorageData(): StateModel {
    return store.get(stateKey) as StateModel;
}
