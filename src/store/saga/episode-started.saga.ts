import {
    seriesEpisodeStartedAction,
    setSeriesEpisodeNextEpisodeStateAction,
    setSeriesEpisodePreviousEpisodeStateAction
} from '../reducers/series-episode.reducer';
import { getNeighbourEpisode } from './shared-sagas/neighbour-episode.saga';
import { getSeriesForEpisode } from '../selectors/series.selector';
import { put, select } from 'redux-saga/effects';
import { setLastWatchedEpisodeAction } from '../reducers/series.reducer';

export function* episodeStartedSaga(action: ReturnType<typeof seriesEpisodeStartedAction>) {
    const { seriesEpisodeKey } = action.payload;

    const series = getSeriesForEpisode(yield select(), seriesEpisodeKey);
    yield put(setLastWatchedEpisodeAction({ seriesEpisodeKey, seriesKey: series.key }));

    const nextEpisode = yield getNeighbourEpisode(seriesEpisodeKey, series.lastUsedPortal, true);
    yield put(setSeriesEpisodeNextEpisodeStateAction({
        seriesEpisodeKey,
        hasNextEpisode: Boolean(nextEpisode)
    }));

    const previousEpisode = yield getNeighbourEpisode(seriesEpisodeKey, series.lastUsedPortal, false);
    yield put(setSeriesEpisodePreviousEpisodeStateAction({
        seriesEpisodeKey,
        hasPreviousEpisode: Boolean(previousEpisode)
    }));
}
