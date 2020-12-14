import { put, select } from 'redux-saga/effects';
import { startPreviousEpisodeAction } from '../actions/shared.actions';
import SeriesEpisode from '../models/series-episode.model';
import { getSeriesForEpisode } from '../selectors/series.selector';
import { stopPlayer } from '../utils/stop-player.util';
import { startEpisode } from './start-episode.saga';
import { getNeighbourEpisode } from './portal-load-series-data/load-neighbour-series-episode.saga';
import {
    addAsyncInteractionAction,
    raisePlayedEpisodesAction,
    removeAsyncInteractionAction,
    resetPlayedEpisodesAction,
} from '../reducers/control-state.reducer';
import { AsyncInteractionType } from '../enums/async-interaction-type.enum';
import { generateAsyncInteraction } from '../utils/async-interaction.util';
import { Logger } from '../../shared/services/logger';

export function* continueAutoplaySaga(action: ReturnType<typeof startPreviousEpisodeAction>) {
    stopPlayer();
    const episodeKey = action.payload;

    const asyncInteraction = generateAsyncInteraction(AsyncInteractionType.SAGA_START_CONTINUE_AUTOPLAY, { episodeKey });
    yield put(addAsyncInteractionAction(asyncInteraction));

    try {
        yield put(resetPlayedEpisodesAction());

        const series = getSeriesForEpisode(yield select(), episodeKey);

        const nextEpisode: SeriesEpisode = yield getNeighbourEpisode(episodeKey, series.lastUsedPortal, true);
        if (!nextEpisode) {
            return;
        }

        const episodeStartSuccessful: boolean = yield startEpisode({
            episodeKey: nextEpisode.key,
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
