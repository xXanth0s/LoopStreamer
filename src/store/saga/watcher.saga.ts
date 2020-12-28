import { debounce, takeLatest } from 'redux-saga/effects';
import {
    setSearchTextAction,
    setSelectedSeasonForAppAction,
    setSelectedSeriesAction
} from '../reducers/app-control-state.reducer';
import { seriesEpisodeStartedAction, setSeriesEpisodeTimeStampAction } from '../reducers/series-episode.reducer';
import { episodeTimeUpdateSaga } from './video-meta-data/series-time.saga';
import {
    appStartedAction,
    continueAutoplayAction,
    startEpisodeAction,
    startNextEpisodeAction,
    startPreviousEpisodeAction,
} from '../actions/shared.actions';
import { startEpisodeSaga } from './autoplay-control/start-episode.saga';
import { startNextEpisodeSaga } from './autoplay-control/start-next-episode.saga';
import { startPreviousEpisodeSaga } from './autoplay-control/start-previous-episode.saga';
import { episodeStartedSaga } from './video-meta-data/episode-started.saga';
import { continueAutoplaySaga } from './autoplay-control/continue-autoplay.saga';
import { Logger } from '../../shared/services/logger';
import { loadSeriesStartPageContentSaga } from './series-api/load-series-start-page-content.saga';
import { loadDetailedSeriesInformationFromApiSaga } from './series-api/load-detailed-series-information-from-api.saga';
import { loadSeriesGenresSaga } from './series-api/load-series-genres.saga';
import { loadSeasonInformationFromPortalSaga } from './portal-load-series-data/load-season.saga';
import { loadSimilarSeriesSaga } from './series-api/load-similar-series.saga';
import { loadSeriesSearchResultSaga } from './series-api/load-series-search-result.saga';
import { createLastWatchedSeriesCollectionSaga } from './video-meta-data/last-watched-series-collection.saga';

export function* watcherSaga() {
    try {
        yield takeLatest(appStartedAction.type, loadSeriesGenresSaga);
        yield takeLatest(appStartedAction.type, loadSeriesStartPageContentSaga);
        yield takeLatest(appStartedAction.type, createLastWatchedSeriesCollectionSaga);

        yield takeLatest(setSelectedSeriesAction.type, loadDetailedSeriesInformationFromApiSaga);
        yield takeLatest(setSelectedSeriesAction.type, loadSimilarSeriesSaga);
        yield takeLatest(setSelectedSeasonForAppAction.type, loadSeasonInformationFromPortalSaga);
        yield debounce(1000, setSearchTextAction.type, loadSeriesSearchResultSaga);

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
