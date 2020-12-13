import { all, call, put, select } from 'redux-saga/effects';
import { MovieDBService } from '../../../shared/services/movie-db.service';
import { StateModel } from '../../models/state.model';
import { NamedCollection } from '../../models/collection.model';
import Series from '../../models/series.model';
import { addOrReplaceMultipleSeriesCollectionAction } from '../../reducers/app-control-state.reducer';
import { updateOrAddMultipleSeriesAction } from '../../reducers/series.reducer';
import { Logger } from '../../../shared/services/logger';

export function* loadSeriesStartPageContentSaga() {
    try {
        const state: StateModel = yield select();
        const [ popularSeries, topRatedSeries, airingTodaySeries ]: [ Series[], Series[], Series[] ] = yield all([
            call(MovieDBService.getPopularSeries, state.options.defaultLanguage),
            call(MovieDBService.getTopRatedSeries, state.options.defaultLanguage),
            call(MovieDBService.getAiringTodaySeries, state.options.defaultLanguage),
        ]);

        const popularSeriesCollection: NamedCollection<Series> = {
            key: 'Populärste Serien',
            title: 'Populärste Serien',
            data: popularSeries.map(series => series.key),
        };

        const topRatedSeriesCollection: NamedCollection<Series> = {
            key: 'Best bewertete Serien',
            title: 'Best bewertete Serien',
            data: topRatedSeries.map(series => series.key),
        };

        const airingTodaySeriesCollection: NamedCollection<Series> = {
            key: 'Aktuell im Fernsehen',
            title: 'Aktuell im Fernsehen',
            data: airingTodaySeries.map(series => series.key),
        };

        yield put(updateOrAddMultipleSeriesAction([
            ...popularSeries,
            ...topRatedSeries,
            ...airingTodaySeries
        ]));

        yield put(addOrReplaceMultipleSeriesCollectionAction({
            collections: [
                popularSeriesCollection,
                topRatedSeriesCollection,
                airingTodaySeriesCollection
            ]
        }));
    } catch (error) {
        Logger.error('[loadSeriesStartPageContentSaga] error occurred', error);
    }
}
