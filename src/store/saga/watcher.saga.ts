import {
    setActivePortalForAppAction,
    setSelectedSeasonForAppAction,
    toggleSelectedSeriesForAppAction
} from '../reducers/app-control-state.reducer';
import {
    loadAllSeriesForPortal,
    loadDetailedSeasonInformation,
    loadDetailedSeriesInformation
} from './load-series.saga';
import { takeEvery, takeLatest } from 'redux-saga/effects';
import { setSeriesEpisodeTimeStampAction } from '../reducers/series-episode.reducer';
import { setEpisodeEndedState } from './series-time.saga';
import { startEpisodeAction } from '../actions/shared.actions';
import { startEpisodeSaga } from './start-episode.saga';

export function* watcherSaga() {
    yield takeLatest(setActivePortalForAppAction.type, loadAllSeriesForPortal);
    yield takeEvery(toggleSelectedSeriesForAppAction.type, loadDetailedSeriesInformation);
    yield takeEvery(setSelectedSeasonForAppAction.type, loadDetailedSeasonInformation);

    // episode state controlling
    yield takeLatest(setSeriesEpisodeTimeStampAction.type, setEpisodeEndedState);

    // controll actions from app
    yield takeEvery(startEpisodeAction.type, startEpisodeSaga);
}
