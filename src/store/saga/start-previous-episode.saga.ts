import { startPreviousEpisodeAction } from '../actions/shared.actions';
import { put, select } from 'redux-saga/effects';
import SeriesEpisode from '../models/series-episode.model';
import { getSeriesForEpisode } from '../selectors/series.selector';
import { stopPlayer } from '../utils/stop-player.util';
import { startEpisode } from './start-episode.saga';
import { getNeighbourEpisode } from './load-series-data/load-neighbour-series-episode.saga';
import { generateAsyncInteraction } from '../store/async-interaction.util';
import { AsyncInteractionType } from '../enums/async-interaction-type.enum';
import { addAsyncInteractionAction, removeAsyncInteractionAction } from '../reducers/control-state.reducer';
import { Logger } from '../../shared/services/logger';


export function* startPreviousEpisodeSaga(action: ReturnType<typeof startPreviousEpisodeAction>) {
    stopPlayer();
    const episodeKey = action.payload;
    const asyncInteraction = generateAsyncInteraction(AsyncInteractionType.SAGA_START_PREVIOUS_EPISODE, { episodeKey });
    yield put(addAsyncInteractionAction(asyncInteraction));
    try {
        const series = getSeriesForEpisode(yield select(), episodeKey);

        const previousEpisode: SeriesEpisode = yield getNeighbourEpisode(episodeKey, series.lastUsedPortal, false);
        if (previousEpisode) {
            yield startEpisode({ episodeKey: previousEpisode.key, language: series.lastUsedLanguage });
        }
    } catch (error) {
        Logger.error('[startPreviousEpisodeSaga] error occurred', error);
    } finally {
        yield put(removeAsyncInteractionAction(asyncInteraction.key));
    }
}
