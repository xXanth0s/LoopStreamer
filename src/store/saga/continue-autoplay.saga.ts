import { startPreviousEpisodeAction } from '../actions/shared.actions';
import { put, select } from 'redux-saga/effects';
import SeriesEpisode from '../models/series-episode.model';
import { getSeriesForEpisode } from '../selectors/series.selector';
import { stopPlayer } from '../utils/stop-player.util';
import { startEpisode } from './start-episode.saga';
import { getNeighbourEpisode } from './load-series-data/load-neighbour-series-episode.saga';
import { raisePlayedEpisodesAction, resetPlayedEpisodesAction } from '../reducers/control-state.reducer';


export function* continueAutoplaySaga(action: ReturnType<typeof startPreviousEpisodeAction>) {
    stopPlayer();
    const episodeKey = action.payload;

    yield put(resetPlayedEpisodesAction());

    const series = getSeriesForEpisode(yield select(), episodeKey);

    const nextEpisode: SeriesEpisode = yield getNeighbourEpisode(episodeKey, series.lastUsedPortal, true);
    if (!nextEpisode) {
        return;
    }

    const episodeStartSuccessful: boolean = yield startEpisode({
        episodeKey: nextEpisode.key,
        language: series.lastUsedLanguage
    });

    if (episodeStartSuccessful) {
        yield put(raisePlayedEpisodesAction());
    }
}
