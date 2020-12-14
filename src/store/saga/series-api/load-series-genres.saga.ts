import { call, put, select } from 'redux-saga/effects';
import { StateModel } from '../../models/state.model';
import { Logger } from '../../../shared/services/logger';
import { MovieDBService } from '../../../shared/services/movie-db.service';
import { Genre } from '../../models/genre.model';
import { addMultipleGenresAction } from '../../reducers/genre.reducer';

export function* loadSeriesGenresSaga() {
    const state: StateModel = yield select();
    const { defaultLanguage } = state.options;

    try {
        const genres: Genre[] = yield call(MovieDBService.loadGenres, defaultLanguage);

        yield put(addMultipleGenresAction({ genres }));
    } catch (error) {
        Logger.error('[loadSeriesGenresSaga] error occurred', error);
    }

}
