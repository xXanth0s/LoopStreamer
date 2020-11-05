import { startNextEpisodeAction } from '../actions/shared.actions';
import { select } from 'redux-saga/effects';
import { StateModel } from '../models/state.model';
import SeriesEpisode from '../models/series-episode.model';
import { getSeriesForEpisode } from '../selectors/series.selector';
import { isMaximumPlayedEpisodesLimitReached } from '../selectors/control-state.selector';
import { stopPlayer } from '../utils/stop-player.util';
import { startEpisode } from './start-episode.saga';
import { getNeighbourEpisode } from './shared-sagas/neighbour-episode.saga';


export function* startNextEpisode(action: ReturnType<typeof startNextEpisodeAction>) {
    stopPlayer();
    const { episodeKey, userAction } = action.payload;

    const state: StateModel = yield select();

    const episodeLimitReached = isMaximumPlayedEpisodesLimitReached(state);

    if (episodeLimitReached && !userAction) {
        return;
    }

    const series = getSeriesForEpisode(state, episodeKey);

    const nextEpisode: SeriesEpisode = yield getNeighbourEpisode(episodeKey, series.lastUsedPortal, true);
    if (nextEpisode) {
        yield startEpisode(nextEpisode.key);
    }
}
