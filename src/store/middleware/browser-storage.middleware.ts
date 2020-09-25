import { Dispatch, Middleware, MiddlewareAPI } from 'redux';

export const BrowserStorageMiddlerware: Middleware =  ({ getState }: MiddlewareAPI) => (
    next: Dispatch
) => async action => {
    const returnValue = next(action);

    const state = getState();
    try {
        // await browser.storage.local.set(state);
    } catch (e) {
        console.error('BrowserStorageMiddlerware: data could not be saved to chrome local storage');
        console.error(e);
    }

    return returnValue;
};
