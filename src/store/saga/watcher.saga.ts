import {
    setActivePortalForAppAction,
    setSelectedSeasonForAppAction,
    toggleSelectedSeriesForAppAction
} from '../reducers/app-control-state.reducer';
import { loadSeriesInformationSaga } from './load-series-data/load-series.saga';
import { takeEvery, takeLatest } from 'redux-saga/effects';
import { seriesEpisodeStartedAction, setSeriesEpisodeTimeStampAction } from '../reducers/series-episode.reducer';
import { episodeTimeUpdateSaga } from './series-time.saga';
import {
    continueAutoplayAction,
    startEpisodeAction,
    startNextEpisodeAction,
    startPreviousEpisodeAction,
    userChangedLanguageAction
} from '../actions/shared.actions';
import { startEpisodeSaga } from './start-episode.saga';
import { loadAllSeriesForPortal } from './load-series-data/load-all-series.saga';
import { loadSeasonInformationSaga } from './load-series-data/load-season.saga';
import { startNextEpisode } from './start-next-episode.saga';
import { startPreviousEpisodeSaga } from './start-previous-episode.saga';
import { episodeStartedSaga } from './episode-started.saga';
import { continueAutoplaySaga } from './continue-autoplay.saga';
import { Logger } from '../../shared/services/logger';
import { loadSeriesSeasonForLanguageSaga } from './load-series-data/load-series-season-for-language.saga';

export function* watcherSaga() {
    try {
        yield takeLatest(setActivePortalForAppAction.type, loadAllSeriesForPortal);
        yield takeEvery(toggleSelectedSeriesForAppAction.type, loadSeriesInformationSaga);
        yield takeEvery(setSelectedSeasonForAppAction.type, loadSeasonInformationSaga);

        // episode state controlling
        yield takeLatest(setSeriesEpisodeTimeStampAction.type, episodeTimeUpdateSaga);
        yield takeEvery(seriesEpisodeStartedAction.type, episodeStartedSaga);

        // control actions from app
        yield takeLatest(startEpisodeAction.type, startEpisodeSaga);
        yield takeLatest(userChangedLanguageAction.type, loadSeriesSeasonForLanguageSaga);

        // control actions from video
        yield takeLatest(startNextEpisodeAction.type, startNextEpisode);
        yield takeLatest(startPreviousEpisodeAction.type, startPreviousEpisodeSaga);
        yield takeLatest(continueAutoplayAction.type, continueAutoplaySaga);
    } catch (e) {
        Logger.error('[WatcherSaga] Error occurred', e);
        throw new Error(e);
    }
}


export function sagaErrorHandler(error: Error, errorInfo) {
    Logger.error(`[WatcherSage] error occured`, error, errorInfo);
}
