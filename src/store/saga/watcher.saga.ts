import { setSelectedSeasonForAppAction, toggleSelectedSeriesForAppAction } from '../reducers/app-control-state.reducer';
import { loadSeriesInformationSaga } from './portal-load-series-data/load-series.saga';
import { takeLatest } from 'redux-saga/effects';
import { seriesEpisodeStartedAction, setSeriesEpisodeTimeStampAction } from '../reducers/series-episode.reducer';
import { episodeTimeUpdateSaga } from './series-time.saga';
import {
    appStartedAction,
    continueAutoplayAction,
    startEpisodeAction,
    startNextEpisodeAction,
    startPreviousEpisodeAction,
    userChangedLanguageAction
} from '../actions/shared.actions';
import { startEpisodeSaga } from './start-episode.saga';
import { loadSeasonInformationSaga } from './portal-load-series-data/load-season.saga';
import { startNextEpisodeSaga } from './start-next-episode.saga';
import { startPreviousEpisodeSaga } from './start-previous-episode.saga';
import { episodeStartedSaga } from './episode-started.saga';
import { continueAutoplaySaga } from './continue-autoplay.saga';
import { Logger } from '../../shared/services/logger';
import { loadSeriesSeasonForLanguageSaga } from './portal-load-series-data/load-series-season-for-language.saga';
import { loadSeriesStartPageContentSaga } from './series-api/load-series-start-page-content.saga';

export function* watcherSaga() {
    try {
        yield takeLatest(appStartedAction.type, loadSeriesStartPageContentSaga);

        yield takeLatest(toggleSelectedSeriesForAppAction.type, loadSeriesInformationSaga);
        yield takeLatest(setSelectedSeasonForAppAction.type, loadSeasonInformationSaga);

        // episode state controlling
        yield takeLatest(setSeriesEpisodeTimeStampAction.type, episodeTimeUpdateSaga);
        yield takeLatest(seriesEpisodeStartedAction.type, episodeStartedSaga);

        // control actions from app
        yield takeLatest(startEpisodeAction.type, startEpisodeSaga);
        yield takeLatest(userChangedLanguageAction.type, loadSeriesSeasonForLanguageSaga);

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
    Logger.error(`[WatcherSage] error occurred`, error, errorInfo);
}
