import { put, select } from 'redux-saga/effects';
import { startNextEpisodeAction } from '../actions/shared.actions';
import { StateModel } from '../models/state.model';
import SeriesEpisode from '../models/series-episode.model';
import { getSeriesForEpisode } from '../selectors/series.selector';
import { isMaximumPlayedEpisodesLimitReached } from '../selectors/control-state.selector';
import { stopPlayer } from '../utils/stop-player.util';
import { startEpisode } from './start-episode.saga';
import { getNeighbourEpisode } from './portal-load-series-data/load-neighbour-series-episode.saga';
import {
    addAsyncInteractionAction,
    raisePlayedEpisodesAction,
    removeAsyncInteractionAction,
} from '../reducers/control-state.reducer';
import { setSeriesEpisodeTimeStampAction } from '../reducers/series-episode.reducer';
import { Logger } from '../../shared/services/logger';
import { generateAsyncInteraction } from '../utils/async-interaction.util';
import { AsyncInteractionType } from '../enums/async-interaction-type.enum';

export function* startNextEpisodeSaga(action: ReturnType<typeof startNextEpisodeAction>) {
    stopPlayer();
    const { episodeKey, userAction } = action.payload;

    const asyncInteraction = generateAsyncInteraction(AsyncInteractionType.SAGA_START_NEXT_EPISODE, { episodeKey });
    yield put(addAsyncInteractionAction(asyncInteraction));

    try {
        const state: StateModel = yield select();
        const episodeLimitReached = isMaximumPlayedEpisodesLimitReached(state);

        if (episodeLimitReached && !userAction) {
            return;
        }

        const series = getSeriesForEpisode(state, episodeKey);

        const nextEpisode: SeriesEpisode = yield getNeighbourEpisode(episodeKey, series.lastUsedPortal, true);
        if (!nextEpisode) {
            return;
        }
        if (!userAction) {
            yield put(setSeriesEpisodeTimeStampAction({ seriesEpisodeKey: nextEpisode.key, timestamp: null }));
        }

        const episodeStartSuccessful: boolean = yield startEpisode({
            episodeKey: nextEpisode.key,
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
