import { put, select } from 'redux-saga/effects';
import { CollectionType } from '../../enums/collection-key.enum';
import { getWatchedSeries } from '../../selectors/watched-series.selector';
import { addOrReplaceSeriesCollectionAction } from '../../reducers/app-control-state.reducer';

export function* createLastWatchedSeriesCollectionSaga() {
    const watchedSeries = getWatchedSeries(yield select());

    const collection = {
        key: CollectionType.LAST_WATCHED_SERIES,
        type: CollectionType.LAST_WATCHED_SERIES,
        title: 'Zuletzt gesehene Serien',
        data: watchedSeries,
    };

    yield put(addOrReplaceSeriesCollectionAction({ collection }));
}
