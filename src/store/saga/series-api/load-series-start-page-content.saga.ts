import { call, put, select } from 'redux-saga/effects';
import { MovieDBService } from '../../../shared/services/movie-db.service';
import { StateModel } from '../../models/state.model';
import { NamedCollection } from '../../models/collection.model';
import Series from '../../models/series.model';
import { addOrReplaceSeriesCollectionAction } from '../../reducers/app-control-state.reducer';
import { updateOrAddMultipleSeriesAction } from '../../reducers/series.reducer';

export function* loadSeriesStartPageContentSaga() {
    const state: StateModel = yield select();
    const popularSeries: Series[] = yield call(MovieDBService.getPopularSeries, state.options.defaultLanguage);

    const popularSeriesCollection: NamedCollection<Series> = {
        key: 'Populärste Serien',
        title: 'Populärste Serien',
        data: popularSeries.map(series => series.key),
    };

    yield put(updateOrAddMultipleSeriesAction(popularSeries));
    yield put(addOrReplaceSeriesCollectionAction({ collection: popularSeriesCollection }));
}
