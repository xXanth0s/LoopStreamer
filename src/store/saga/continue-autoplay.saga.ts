import { put, select } from 'redux-saga/effects';
import { startPreviousEpisodeAction } from '../actions/shared.actions';
import { getSeriesForEpisode } from '../selectors/series.selector';
import { stopPlayer } from '../utils/stop-player.util';
import { startEpisode } from './start-episode.saga';
import { getPortalLinkForNextEpisode } from './portal-load-series-data/load-neighbour-series-episode.saga';
import {
    addAsyncInteractionAction,
    raisePlayedEpisodesAction,
    removeAsyncInteractionAction,
    resetPlayedEpisodesAction,
} from '../reducers/control-state.reducer';
import { Logger } from '../../shared/services/logger';
import { LinkModel } from '../models/link.model';
import { continueAutoplayAsyncInteraction } from '../actions/async-interactions';

export function* continueAutoplaySaga(action: ReturnType<typeof startPreviousEpisodeAction>) {
    stopPlayer();
    const episodeKey = action.payload;

    const asyncInteraction = continueAutoplayAsyncInteraction({ episodeKey });
    yield put(addAsyncInteractionAction(asyncInteraction));

    try {
        yield put(resetPlayedEpisodesAction());

        const series = getSeriesForEpisode(yield select(), episodeKey);

        const nextEpisodeLink: LinkModel = yield getPortalLinkForNextEpisode(episodeKey, series.lastUsedPortal, series.lastUsedLanguage);
        if (!nextEpisodeLink) {
            return;
        }

        const episodeStartSuccessful: boolean = yield startEpisode({
            episodeKey: nextEpisodeLink.parentKey,
            language: series.lastUsedLanguage,
        });

        if (episodeStartSuccessful) {
            yield put(raisePlayedEpisodesAction());
        }
    } catch (error) {
        Logger.error('[continueAutoplaySaga] error occurred', error);
    } finally {
        yield put(removeAsyncInteractionAction(asyncInteraction.key));
    }
}
