import {
    setSeriesEpisodeFinishedStateAction,
    setSeriesEpisodeTimeStampAction
} from '../reducers/series-episode.reducer';
import { getSeriesEpisodeByKey } from '../selectors/series-episode.selector';
import { getSeriesByKey } from '../selectors/series.selector';
import { getPopupEndTimeForSeriesEpisode } from '../utils/series.utils';
import { put, select } from 'redux-saga/effects';
import { getNeighbourEpisode } from './shared-sagas/neighbour-episode.saga';
import { setLastWatchedEpisodeAction } from '../reducers/series.reducer';

export function* setEpisodeEndedStateSaga(action: ReturnType<typeof setSeriesEpisodeTimeStampAction>) {
    const { seriesEpisodeKey, timestamp } = action.payload;
    const state = yield select();
    const seriesEpisode = getSeriesEpisodeByKey(state, seriesEpisodeKey);
    const series = getSeriesByKey(state, seriesEpisode.seriesKey);

    const timeLeft = seriesEpisode.duration - timestamp;

    const timeWhenSeriesIsFinished = getPopupEndTimeForSeriesEpisode(series);

    const isFinished = timeLeft <= timeWhenSeriesIsFinished;
    if (seriesEpisode.isFinished === isFinished) {
        return;
    }

    yield put(setSeriesEpisodeFinishedStateAction({
        seriesEpisodeKey,
        isFinished,
    }));

    if (!isFinished && series.lastEpisodeWatched !== seriesEpisodeKey) {
        yield put(setLastWatchedEpisodeAction({ seriesKey: series.key, seriesEpisodeKey: seriesEpisodeKey }));
        return;
    }

    const nextEpisode = yield getNeighbourEpisode(seriesEpisodeKey, series.lastUsedPortal, true);
    if (nextEpisode) {
        yield put(setLastWatchedEpisodeAction({ seriesKey: series.key, seriesEpisodeKey: nextEpisode.key }));
    }
}
