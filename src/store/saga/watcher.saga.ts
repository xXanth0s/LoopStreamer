import { setActivePortalForAppAction, toggleSelectedSeriesForAppAction } from '../reducers/app-control-state.reducer';
import { loadDetailedSeriesInformation, loadSeriesForPortal } from './load-series.saga';
import { takeEvery, takeLatest } from 'redux-saga/effects';

export function* watcherSaga() {
    yield takeLatest(setActivePortalForAppAction.type, loadSeriesForPortal);
    yield takeEvery(toggleSelectedSeriesForAppAction.type, loadDetailedSeriesInformation);
}
