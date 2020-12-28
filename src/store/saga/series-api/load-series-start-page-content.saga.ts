import { all, call, put, select, } from 'redux-saga/effects';
import { MovieDBService } from '../../../shared/services/movie-db.service';
import { StateModel } from '../../models/state.model';
import { NamedCollection } from '../../models/collection.model';
import { addOrReplaceMultipleSeriesCollectionAction } from '../../reducers/app-control-state.reducer';
import { Logger } from '../../../shared/services/logger';
import { SeriesMetaInfo } from '../../models/series-meta-info.model';
import { addMultipleSeriesMetaInfosAction } from '../../reducers/series-meta-info.reducer';
import { CollectionType } from '../../enums/collection-key.enum';
import { getWatchedSeries } from '../../selectors/watched-series.selector';
import { reduceArraySize } from '../../../utils/array.utils';
import { getMovieDbApiKeysForSeries, getSeriesByKey } from '../../selectors/series.selector';

export function* loadSeriesStartPageContentSaga() {
    try {
        const state: StateModel = yield select();
        const watchedSeries = getWatchedSeries(state);
        const language = state.options.defaultLanguage;
        const [ popularSeries, topRatedSeries, airingTodaySeries, similarSeries ]: [ SeriesMetaInfo[], SeriesMetaInfo[], SeriesMetaInfo[], SeriesMetaInfo[][] ] =
            yield all([
                call(MovieDBService.getPopularSeries, language),
                call(MovieDBService.getTopRatedSeries, language),
                call(MovieDBService.getAiringTodaySeries, language),
                ...getSimilarSeriesForLastWatchedSeries(state)
            ]);

        const popularSeriesCollection: NamedCollection<SeriesMetaInfo> = {
            key: CollectionType.MOST_POPULAR_SERIES,
            type: CollectionType.MOST_POPULAR_SERIES,
            title: 'Populärste Serien',
            data: popularSeries.map(series => series.key),
        };

        const topRatedSeriesCollection: NamedCollection<SeriesMetaInfo> = {
            key: CollectionType.TOP_RATED_SERIES,
            type: CollectionType.TOP_RATED_SERIES,
            title: 'Best bewertete Serien',
            data: topRatedSeries.map(series => series.key),
        };

        const airingTodaySeriesCollection: NamedCollection<SeriesMetaInfo> = {
            key: CollectionType.IN_TV_SERIES,
            type: CollectionType.IN_TV_SERIES,
            title: 'Aktuell im Fernsehen',
            data: airingTodaySeries.map(series => series.key),
        };

        const similarSeriesCollections: NamedCollection<SeriesMetaInfo>[] = similarSeries.map((seriesCollection, index) => {
            const series = getSeriesByKey(state, watchedSeries[index]);
            return {
                key: `${CollectionType.SIMILAR_SERIES_OVERVIEW}_${index}`,
                type: CollectionType.SIMILAR_SERIES_OVERVIEW,
                title: `Weil Sie ${series.titles[language]} gesehen haben`,
                data: seriesCollection.map(_series => _series.key),
            };
        });

        yield put(addMultipleSeriesMetaInfosAction({
            seriesMetaInfos: [
                ...popularSeries,
                ...topRatedSeries,
                ...airingTodaySeries,
                ...similarSeries.flat()
            ]
        }));

        yield put(addOrReplaceMultipleSeriesCollectionAction({
            collections: [
                popularSeriesCollection,
                topRatedSeriesCollection,
                airingTodaySeriesCollection,
                ...similarSeriesCollections
            ],
        }));
    } catch (error) {
        Logger.error('[loadSeriesStartPageContentSaga] error occurred', error);
    }
}

function* getSimilarSeriesForLastWatchedSeries(state: StateModel) {
    const watchedSeriesKeys = reduceArraySize(getWatchedSeries(state), 3);
    const watchedSeriesApiKeys = getMovieDbApiKeysForSeries(state, watchedSeriesKeys);

    return yield all(watchedSeriesApiKeys.map(apiKey => call(MovieDBService.getSimilarSeries, apiKey, state.options.defaultLanguage)));
}
