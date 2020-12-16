import { put, select } from 'redux-saga/effects';
import {
    seriesEpisodeStartedAction,
    setSeriesEpisodeNextEpisodeStateAction,
    setSeriesEpisodePreviousEpisodeStateAction,
} from '../reducers/series-episode.reducer';
import {
    getPortalLinkForNextEpisode,
    getPortalLinkForPreviousEpisode
} from './portal-load-series-data/load-neighbour-series-episode.saga';
import { getSeriesForEpisode } from '../selectors/series.selector';
import { Logger } from '../../shared/services/logger';
import { LinkModel } from '../models/link.model';

export function* episodeStartedSaga(action: ReturnType<typeof seriesEpisodeStartedAction>) {
    const { seriesEpisodeKey } = action.payload;

    const series = getSeriesForEpisode(yield select(), seriesEpisodeKey);

    try {
        const nextEpisodeLink: LinkModel = yield getPortalLinkForNextEpisode(seriesEpisodeKey, series.lastUsedPortal, series.lastUsedLanguage);
        yield put(setSeriesEpisodeNextEpisodeStateAction({
            seriesEpisodeKey,
            hasNextEpisode: Boolean(nextEpisodeLink),
        }));

        const previousEpisodeLink: LinkModel = yield getPortalLinkForPreviousEpisode(seriesEpisodeKey, series.lastUsedPortal, series.lastUsedLanguage);
        yield put(setSeriesEpisodePreviousEpisodeStateAction({
            seriesEpisodeKey,
            hasPreviousEpisode: Boolean(previousEpisodeLink),
        }));
    } catch (error) {
        Logger.error('[episodeStartedSaga] error occurred', error);
    }
}
