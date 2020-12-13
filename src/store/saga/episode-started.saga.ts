import { put, select } from 'redux-saga/effects';
import {
    seriesEpisodeStartedAction,
    setSeriesEpisodeNextEpisodeStateAction,
    setSeriesEpisodePreviousEpisodeStateAction,
} from '../reducers/series-episode.reducer';
import { getNeighbourEpisode } from './portal-load-series-data/load-neighbour-series-episode.saga';
import { getSeriesForEpisode } from '../selectors/series.selector';
import { Logger } from '../../shared/services/logger';

export function* episodeStartedSaga(action: ReturnType<typeof seriesEpisodeStartedAction>) {
    const { seriesEpisodeKey } = action.payload;

    const series = getSeriesForEpisode(yield select(), seriesEpisodeKey);

    try {
        const nextEpisode = yield getNeighbourEpisode(seriesEpisodeKey, series.lastUsedPortal, true);
        yield put(setSeriesEpisodeNextEpisodeStateAction({
            seriesEpisodeKey,
            hasNextEpisode: Boolean(nextEpisode),
        }));

        const previousEpisode = yield getNeighbourEpisode(seriesEpisodeKey, series.lastUsedPortal, false);
        yield put(setSeriesEpisodePreviousEpisodeStateAction({
            seriesEpisodeKey,
            hasPreviousEpisode: Boolean(previousEpisode),
        }));
    } catch (error) {
        Logger.error('[episodeStartedSaga] error occurred', error);
    }
}
