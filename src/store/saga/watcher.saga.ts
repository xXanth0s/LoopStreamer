import { takeLatest } from 'redux-saga/effects';
import { setSelectedSeasonForAppAction, setSelectedSeriesAction, } from '../reducers/app-control-state.reducer';
import { seriesEpisodeStartedAction, setSeriesEpisodeTimeStampAction } from '../reducers/series-episode.reducer';
import { episodeTimeUpdateSaga } from './series-time.saga';
import {
    appStartedAction,
    continueAutoplayAction,
    startEpisodeAction,
    startNextEpisodeAction,
    startPreviousEpisodeAction,
} from '../actions/shared.actions';
import { startEpisodeSaga } from './start-episode.saga';
import { loadSeasonInformationFromPortalSaga } from './portal-load-series-data/load-season.saga';
import { startNextEpisodeSaga } from './start-next-episode.saga';
import { startPreviousEpisodeSaga } from './start-previous-episode.saga';
import { episodeStartedSaga } from './episode-started.saga';
import { continueAutoplaySaga } from './continue-autoplay.saga';
import { Logger } from '../../shared/services/logger';
import { loadSeriesStartPageContentSaga } from './series-api/load-series-start-page-content.saga';
import { loadDetailedSeriesInformationFromApiSaga } from './series-api/load-detailed-series-information-from-api.saga';
import { loadSeriesGenresSaga } from './series-api/load-series-genres.saga';

export function* watcherSaga() {
    try {
        yield takeLatest(appStartedAction.type, loadSeriesGenresSaga);
        yield takeLatest(appStartedAction.type, loadSeriesStartPageContentSaga);

        yield takeLatest(setSelectedSeriesAction.type, loadDetailedSeriesInformationFromApiSaga);
        yield takeLatest(setSelectedSeasonForAppAction.type, loadSeasonInformationFromPortalSaga);

        // episode state controlling
        yield takeLatest(setSeriesEpisodeTimeStampAction.type, episodeTimeUpdateSaga);
        yield takeLatest(seriesEpisodeStartedAction.type, episodeStartedSaga);

        // control actions from app
        yield takeLatest(startEpisodeAction.type, startEpisodeSaga);

        // control actions from video
        yield takeLatest(startNextEpisodeAction.type, startNextEpisodeSaga);
        yield takeLatest(startPreviousEpisodeAction.type, startPreviousEpisodeSaga);
        yield takeLatest(continueAutoplayAction.type, continueAutoplaySaga);
    } catch (e) {
        Logger.error('[WatcherSaga] Error occurred', e);
        throw new Error(e);
    }
}

export function sagaErrorHandler(error: Error, errorInfo) {
    Logger.error('[WatcherSage] error occurred', error, errorInfo);
}
