import { call, put, select } from 'redux-saga/effects';
import { setSelectedSeriesAction } from 'src/store/reducers/app-control-state.reducer';
import { Logger } from '../../../shared/services/logger';
import { MovieDBService } from '../../../shared/services/movie-db.service';
import { StateModel } from '../../models/state.model';
import { getSeriesByKey } from '../../selectors/series.selector';
import { MovieApi } from '../../enums/movie-api.enum';
import Series from '../../models/series.model';
import { SeriesSeason } from '../../models/series-season.model';
import SeriesEpisode from '../../models/series-episode.model';
import { updateOrAddSeriesAction } from '../../reducers/series.reducer';
import { updateOrAddMutlipleSeriesSeasonAction } from '../../reducers/series-season.reducer';
import { updateOrAddMultipleSeriesEpisodeAction } from '../../reducers/series-episode.reducer';

export function* loadDetailedSeriesInformationSaga(action: ReturnType<typeof setSelectedSeriesAction>) {
    const { selectedSeriesKey } = action.payload;
    try {
        const state: StateModel = yield select();
        const stateSeries = getSeriesByKey(state, selectedSeriesKey);
        const [ series, seasons, episodes ]: [ Series, SeriesSeason[], SeriesEpisode[] ] = yield call(MovieDBService.getDetailedSeriesInformation, stateSeries.apiKeys[MovieApi.TMDB], state.options.defaultLanguage);

        yield put(updateOrAddSeriesAction(series));
        yield put(updateOrAddMutlipleSeriesSeasonAction(seasons));
        yield put(updateOrAddMultipleSeriesEpisodeAction(episodes));
    } catch (error) {
        Logger.error('[loadSeriesStartPageContentSaga] error occurred', error);
    }
}
