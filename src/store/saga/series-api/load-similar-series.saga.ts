import { call, put, select, } from 'redux-saga/effects';
import { addOrReplaceSeriesCollectionAction, setSelectedSeriesAction } from '../../reducers/app-control-state.reducer';
import { getSeriesMetaInfo } from '../../selectors/series-meta-info.selector';
import { getDefaultLanguage } from '../../selectors/options.selector';
import { MovieDBService } from '../../../shared/services/movie-db.service';
import { MovieApi } from '../../enums/movie-api.enum';
import { NamedCollection } from '../../models/collection.model';
import { SeriesMetaInfo } from '../../models/series-meta-info.model';
import { CollectionKey } from '../../enums/collection-key.enum';
import { addMultipleSeriesMetaInfosAction } from '../../reducers/series-meta-info.reducer';
import { Logger } from '../../../shared/services/logger';

export function* loadSimilarSeriesSaga(action: ReturnType<typeof setSelectedSeriesAction>) {
    try {
        const { selectedSeriesKey } = action.payload;
        const state = yield select();

        const seriesMetaInfo = getSeriesMetaInfo(yield select(), selectedSeriesKey);
        const language = getDefaultLanguage(state);

        const similarSeries = yield call(MovieDBService.getSimilarSeries, seriesMetaInfo.apiKeys[MovieApi.TMDB], language);


        const similarSeriesCollection: NamedCollection<SeriesMetaInfo> = {
            key: CollectionKey.SIMILAR_SERIES_MODAL,
            title: 'Ähnliche Serien',
            data: similarSeries.map(series => series.key),
        };

        yield put(addMultipleSeriesMetaInfosAction({
            seriesMetaInfos: similarSeries
        }));

        yield put(addOrReplaceSeriesCollectionAction({
            collection: similarSeriesCollection,
        }));
    } catch (error) {
        Logger.error('[loadSimilarSeriesSaga] error occurred', error);
    }
}
