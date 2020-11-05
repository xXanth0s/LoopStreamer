import {
    setActivePortalForAppAction,
    setSelectedSeasonForAppAction,
    toggleSelectedSeriesForAppAction
} from '../reducers/app-control-state.reducer';
import { loadSeriesInformationSaga } from './load-series.saga';
import { takeEvery, takeLatest } from 'redux-saga/effects';
import { setSeriesEpisodeTimeStampAction } from '../reducers/series-episode.reducer';
import { setEpisodeEndedState } from './series-time.saga';
import { startEpisodeAction, startNextEpisodeAction } from '../actions/shared.actions';
import { startEpisodeSaga } from './start-episode.saga';
import { loadAllSeriesForPortal } from './load-all-series.saga';
import { loadSeasonInformationSaga } from './load-season.saga';
import { startNextEpisode } from './start-next-episode.saga';

export function* watcherSaga() {
    yield takeLatest(setActivePortalForAppAction.type, loadAllSeriesForPortal);
    yield takeEvery(toggleSelectedSeriesForAppAction.type, loadSeriesInformationSaga);
    yield takeEvery(setSelectedSeasonForAppAction.type, loadSeasonInformationSaga);

    // episode state controlling
    yield takeLatest(setSeriesEpisodeTimeStampAction.type, setEpisodeEndedState);

    // controll actions from app
    yield takeEvery(startEpisodeAction.type, startEpisodeSaga);
    yield takeEvery(startNextEpisodeAction.type, startNextEpisode);
}
