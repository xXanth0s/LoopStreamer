import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import ElectronStore from 'electron-store';
import { StateModel } from '../models/state.model';
import { environment } from '../../environments/environment';

const store = new ElectronStore();
const stateKey = environment.isDev ? 'state-dev' : 'state';

export const StorageMiddlerware: Middleware = ({ getState }: MiddlewareAPI) => ((
    next: Dispatch,
) => async action => {
    const returnValue = next(action);

    const state = cleanupState(getState());

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

function cleanupState(state: StateModel): StateModel {
    const copy = {
        ...state,
    };

    delete copy.controlState;
    delete copy.appControlState;
    delete copy.seriesMetaInfos;

    return copy;
}
