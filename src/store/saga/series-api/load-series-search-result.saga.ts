import { call, put, select, } from 'redux-saga/effects';
import {
    addOrReplaceSeriesCollectionAction,
    removeSeriesCollectionAction,
    setSearchTextAction
} from '../../reducers/app-control-state.reducer';
import { getDefaultLanguage } from '../../selectors/options.selector';
import { MovieDBService } from '../../../shared/services/movie-db.service';
import { NamedCollection } from '../../models/collection.model';
import { SeriesMetaInfo } from '../../models/series-meta-info.model';
import { CollectionType } from '../../enums/collection-key.enum';
import { addMultipleSeriesMetaInfosAction } from '../../reducers/series-meta-info.reducer';
import { Logger } from '../../../shared/services/logger';
import { loadingSeriesSearchResult } from '../../actions/async-interactions';
import { addAsyncInteractionAction, removeAsyncInteractionAction } from '../../reducers/control-state.reducer';

export function* loadSeriesSearchResultSaga(action: ReturnType<typeof setSearchTextAction>) {
    const { searchText } = action.payload;

    if (!searchText) {
        yield put(removeSeriesCollectionAction({
            collectionKey: CollectionType.SEARCH_RESULT_SERIES,
        }));
        return;
    }

    const asyncInteraction = loadingSeriesSearchResult({ searchText });
    yield put(addAsyncInteractionAction(asyncInteraction));
    try {
        const state = yield select();
        const language = getDefaultLanguage(state);
        const searchResult: SeriesMetaInfo[] = yield call(MovieDBService.searchSeries, searchText, language);

        const searchResultCollection: NamedCollection<SeriesMetaInfo> = {
            key: CollectionType.SEARCH_RESULT_SERIES,
            type: CollectionType.SEARCH_RESULT_SERIES,
            title: 'Suchergebnis',
            data: searchResult.map(series => series.key),
        };

        yield put(addMultipleSeriesMetaInfosAction({
            seriesMetaInfos: searchResult
        }));

        yield put(addOrReplaceSeriesCollectionAction({
            collection: searchResultCollection,
        }));
    } catch (error) {
        Logger.error('[loadSeriesSearchResultSaga] error occurred', error);
    } finally {
        yield put(removeAsyncInteractionAction(asyncInteraction.key));
    }
}
