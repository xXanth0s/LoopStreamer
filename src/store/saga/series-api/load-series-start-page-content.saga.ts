import { all, call, put, select, } from 'redux-saga/effects';
import { MovieDBService } from '../../../shared/services/movie-db.service';
import { StateModel } from '../../models/state.model';
import { NamedCollection } from '../../models/collection.model';
import { addOrReplaceMultipleSeriesCollectionAction } from '../../reducers/app-control-state.reducer';
import { Logger } from '../../../shared/services/logger';
import { SeriesMetaInfo } from '../../models/series-meta-info.model';
import { addMultipleSeriesMetaInfosAction } from '../../reducers/series-meta-info.reducer';
import { CollectionKey } from '../../enums/collection-key.enum';

export function* loadSeriesStartPageContentSaga() {
    try {
        const state: StateModel = yield select();
        const [ popularSeries, topRatedSeries, airingTodaySeries ]: [ SeriesMetaInfo[], SeriesMetaInfo[], SeriesMetaInfo[] ] =
            yield all([
                call(MovieDBService.getPopularSeries, state.options.defaultLanguage),
                call(MovieDBService.getTopRatedSeries, state.options.defaultLanguage),
                call(MovieDBService.getAiringTodaySeries, state.options.defaultLanguage),
            ]);

        const popularSeriesCollection: NamedCollection<SeriesMetaInfo> = {
            key: CollectionKey.MOST_POPULAR_SERIES,
            title: 'Populärste Serien',
            data: popularSeries.map(series => series.key),
        };

        const topRatedSeriesCollection: NamedCollection<SeriesMetaInfo> = {
            key: CollectionKey.TOP_RATED_SERIES,
            title: 'Best bewertete Serien',
            data: topRatedSeries.map(series => series.key),
        };

        const airingTodaySeriesCollection: NamedCollection<SeriesMetaInfo> = {
            key: CollectionKey.IN_TV_SERIES,
            title: 'Aktuell im Fernsehen',
            data: airingTodaySeries.map(series => series.key),
        };

        yield put(addMultipleSeriesMetaInfosAction({
            seriesMetaInfos: [
                ...popularSeries,
                ...topRatedSeries,
                ...airingTodaySeries,
            ]
        }));

        yield put(addOrReplaceMultipleSeriesCollectionAction({
            collections: [
                popularSeriesCollection,
                topRatedSeriesCollection,
                airingTodaySeriesCollection,
            ],
        }));
    } catch (error) {
        Logger.error('[loadSeriesStartPageContentSaga] error occurred', error);
    }
}
