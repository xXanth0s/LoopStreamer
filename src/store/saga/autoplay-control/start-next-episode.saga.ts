import { put, select } from 'redux-saga/effects';
import { startNextEpisodeAction } from '../../actions/shared.actions';
import { StateModel } from '../../models/state.model';
import { getSeriesForEpisode } from '../../selectors/series.selector';
import { isMaximumPlayedEpisodesLimitReached } from '../../selectors/control-state.selector';
import { stopPlayer } from '../../utils/stop-player.util';
import { startEpisode } from './start-episode.saga';
import { getPortalLinkForNextEpisode } from '../portal-load-series-data/load-neighbour-series-episode.saga';
import {
    addAsyncInteractionAction,
    raisePlayedEpisodesAction,
    removeAsyncInteractionAction,
} from '../../reducers/control-state.reducer';
import { setSeriesEpisodeTimeStampAction } from '../../reducers/series-episode.reducer';
import { Logger } from '../../../shared/services/logger';
import { LinkModel } from '../../models/link.model';
import { startNextEpisodeAsyncInteraction } from '../../actions/async-interactions';

export function* startNextEpisodeSaga(action: ReturnType<typeof startNextEpisodeAction>) {
    stopPlayer();
    const { episodeKey, userAction } = action.payload;

    const asyncInteraction = startNextEpisodeAsyncInteraction({ episodeKey });
    yield put(addAsyncInteractionAction(asyncInteraction));

    try {
        const state: StateModel = yield select();
        const episodeLimitReached = isMaximumPlayedEpisodesLimitReached(state);

        if (episodeLimitReached && !userAction) {
            return;
        }

        const series = getSeriesForEpisode(state, episodeKey);

        const nextEpisodeLink: LinkModel = yield getPortalLinkForNextEpisode(episodeKey,
            series.lastUsedPortal,
            series.lastUsedLanguage);
        if (!nextEpisodeLink) {
            return;
        }
        if (!userAction) {
            yield put(setSeriesEpisodeTimeStampAction({
                seriesEpisodeKey: nextEpisodeLink.parentKey,
                timestamp: null,
            }));
        }

        const episodeStartSuccessful: boolean = yield startEpisode({
            episodeKey: nextEpisodeLink.parentKey,
            language: series.lastUsedLanguage,
        });

        if (episodeStartSuccessful && !userAction) {
            yield put(raisePlayedEpisodesAction());
        }
    } catch (error) {
        Logger.error('[startNextEpisodeSaga] error occurred', error);
    } finally {
        yield put(removeAsyncInteractionAction(asyncInteraction.key));
    }
}
