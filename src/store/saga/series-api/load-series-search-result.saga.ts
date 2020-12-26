import { call, put, select, } from 'redux-saga/effects';
import {
    addOrReplaceSeriesCollectionAction,
    setSearchTextAction
} from '../../reducers/app-control-state.reducer';
import { getDefaultLanguage } from '../../selectors/options.selector';
import { MovieDBService } from '../../../shared/services/movie-db.service';
import { NamedCollection } from '../../models/collection.model';
import { SeriesMetaInfo } from '../../models/series-meta-info.model';
import { CollectionKey } from '../../enums/collection-key.enum';
import { addMultipleSeriesMetaInfosAction } from '../../reducers/series-meta-info.reducer';
import { Logger } from '../../../shared/services/logger';

export function* loadSeriesSearchResultSaga(action: ReturnType<typeof setSearchTextAction>) {
    try {
        const {searchText} = action.payload;

        let searchResult = [];

        if (searchText) {
            const state = yield select();

            const language = getDefaultLanguage(state);
            searchResult = yield call(MovieDBService.searchSeries, searchText, language);
        }


        const searchResultCollection: NamedCollection<SeriesMetaInfo> = {
            key: CollectionKey.SEARCH_RESULT_SERIES,
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
    }
}
