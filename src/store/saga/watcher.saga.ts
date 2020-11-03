import { setActivePortalForAppAction, toggleSelectedSeriesForAppAction } from '../reducers/app-control-state.reducer';
import { loadDetailedSeriesInformation, loadSeriesForPortal } from './load-series.saga';
import { takeEvery, takeLatest } from 'redux-saga/effects';
import { setSeriesEpisodeTimeStampAction } from '../reducers/series-episode.reducer';
import { setEpisodeEndedState } from './series-time.saga';
import { startEpisodeAction } from '../actions/shared.actions';

export function* watcherSaga() {
    yield takeLatest(setActivePortalForAppAction.type, loadSeriesForPortal);
    yield takeEvery(toggleSelectedSeriesForAppAction.type, loadDetailedSeriesInformation);
    yield takeEvery(setSeriesEpisodeTimeStampAction.type, setEpisodeEndedState);

    // controll actions from app
    yield takeEvery(startEpisodeAction.type, setEpisodeEndedState);
}
