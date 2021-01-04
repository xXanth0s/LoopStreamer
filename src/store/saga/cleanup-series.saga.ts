import { put, select, all } from 'redux-saga/effects';
import { getAllNotWatchedSeries } from '../selectors/series.selector';
import { deleteSeriesAction } from '../actions/shared.actions';

export function* cleanupSeriesSaga() {
    const seriesToDelete = getAllNotWatchedSeries(yield select());

    yield all(seriesToDelete.map(seriesKey => put(deleteSeriesAction(seriesKey))));
}
