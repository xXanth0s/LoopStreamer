import { startPreviousEpisodeAction } from '../actions/shared.actions';
import { select } from 'redux-saga/effects';
import SeriesEpisode from '../models/series-episode.model';
import { getSeriesForEpisode } from '../selectors/series.selector';
import { stopPlayer } from '../utils/stop-player.util';
import { startEpisode } from './start-episode.saga';
import { getNeighbourEpisode } from './load-series-data/load-neighbour-series-episode.saga';


export function* startPreviousEpisodeSaga(action: ReturnType<typeof startPreviousEpisodeAction>) {
    stopPlayer();
    const episodeKey = action.payload;

    const series = getSeriesForEpisode(yield select(), episodeKey);

    const previousEpisode: SeriesEpisode = yield getNeighbourEpisode(episodeKey, series.lastUsedPortal, false);
    if (previousEpisode) {
        yield startEpisode({ episodeKey: previousEpisode.key, language: series.lastUsedLanguage });
    }
}
