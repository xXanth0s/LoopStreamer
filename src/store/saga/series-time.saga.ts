import {
    setSeriesEpisodeFinishedStateAction,
    setSeriesEpisodeTimeStampAction
} from '../reducers/series-episode.reducer';
import { getSeriesEpisodeByKey } from '../selectors/series-episode.selector';
import { getSeriesByKey } from '../selectors/series.selector';
import { getPopupEndTimeForSeriesEpisode } from '../utils/series.utils';
import { put, select } from 'redux-saga/effects';

export function* setEpisodeEndedState(action: ReturnType<typeof setSeriesEpisodeTimeStampAction>) {
    const { seriesEpisodeKey, timestamp } = action.payload;
    const state = yield select();
    const seriesEpisode = getSeriesEpisodeByKey(state, seriesEpisodeKey);
    const series = getSeriesByKey(state, seriesEpisode.seriesKey);

    const timeLeft = seriesEpisode.duration - timestamp;

    const timeWhenSeriesIsFinished = getPopupEndTimeForSeriesEpisode(series);

    const isFinished = timeLeft <= timeWhenSeriesIsFinished;

    yield put(setSeriesEpisodeFinishedStateAction({
        seriesEpisodeKey,
        isFinished,
    }));
}
