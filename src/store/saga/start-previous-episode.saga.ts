import { put, select } from 'redux-saga/effects';
import { startPreviousEpisodeAction } from '../actions/shared.actions';
import { getSeriesForEpisode } from '../selectors/series.selector';
import { stopPlayer } from '../utils/stop-player.util';
import { startEpisode } from './start-episode.saga';
import { getPortalLinkForPreviousEpisode } from './portal-load-series-data/load-neighbour-series-episode.saga';
import { addAsyncInteractionAction, removeAsyncInteractionAction } from '../reducers/control-state.reducer';
import { Logger } from '../../shared/services/logger';
import { LinkModel } from '../models/link.model';
import { startPreviousEpisodeAsyncInteraction } from '../actions/async-interactions';

export function* startPreviousEpisodeSaga(action: ReturnType<typeof startPreviousEpisodeAction>) {
    stopPlayer();
    const seriesEpisodeKey = action.payload;
    const asyncInteraction = startPreviousEpisodeAsyncInteraction({ episodeKey: seriesEpisodeKey });
    yield put(addAsyncInteractionAction(asyncInteraction));
    try {
        const series = getSeriesForEpisode(yield select(), seriesEpisodeKey);

        const previousEpisodeLink: LinkModel = yield getPortalLinkForPreviousEpisode(seriesEpisodeKey, series.lastUsedPortal, series.lastUsedLanguage);
        if (previousEpisodeLink) {
            yield startEpisode({ episodeKey: previousEpisodeLink.parentKey, language: series.lastUsedLanguage });
        }
    } catch (error) {
        Logger.error('[startPreviousEpisodeSaga] error occurred', error);
    } finally {
        yield put(removeAsyncInteractionAction(asyncInteraction.key));
    }
}
