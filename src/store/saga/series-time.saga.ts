import { put, select } from 'redux-saga/effects';
import {
    setSeriesEpisodeFinishedStateAction,
    setSeriesEpisodeTimeStampAction,
} from '../reducers/series-episode.reducer';
import { getSeriesEpisodeByKey } from '../selectors/series-episode.selector';
import { getSeriesByKey } from '../selectors/series.selector';
import { getPopupEndTimeForSeriesEpisode } from '../utils/series.utils';
import { getPortalLinkForNextEpisode } from './portal-load-series-data/load-neighbour-series-episode.saga';
import { setLastWatchedEpisodeAction } from '../reducers/series.reducer';
import { LinkModel } from '../models/link.model';

export function* episodeTimeUpdateSaga(action: ReturnType<typeof setSeriesEpisodeTimeStampAction>) {
    const { seriesEpisodeKey, timestamp } = action.payload;
    const state = yield select();
    const seriesEpisode = getSeriesEpisodeByKey(state, seriesEpisodeKey);
    const series = getSeriesByKey(state, seriesEpisode.seriesKey);

    const timeLeft = seriesEpisode.duration - timestamp;
    const timeWhenSeriesIsFinished = getPopupEndTimeForSeriesEpisode(series);

    const isFinished = timeLeft <= timeWhenSeriesIsFinished;

    if (!isFinished && series.lastEpisodeWatched !== seriesEpisodeKey) {
        yield put(setLastWatchedEpisodeAction({ seriesKey: series.key, seriesEpisodeKey }));
        return;
    }

    if (seriesEpisode.isFinished === isFinished) {
        return;
    }

    yield put(setSeriesEpisodeFinishedStateAction({
        seriesEpisodeKey,
        isFinished,
    }));

    const nextEpisodeLink: LinkModel = yield getPortalLinkForNextEpisode(seriesEpisodeKey, series.lastUsedPortal, series.lastUsedLanguage);
    if (nextEpisodeLink) {
        yield put(setLastWatchedEpisodeAction({ seriesKey: series.key, seriesEpisodeKey: nextEpisodeLink.parentKey }));
    }
}
