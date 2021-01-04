import { call, put, select } from 'redux-saga/effects';
import { setSelectedSeasonForAppAction, setSelectedSeriesAction } from '../../reducers/app-control-state.reducer';
import { Logger } from '../../../shared/services/logger';
import { MovieDBService } from '../../../shared/services/movie-db.service';
import { MovieApi } from '../../enums/movie-api.enum';
import { Series } from '../../models/series.model';
import { SeriesSeason } from '../../models/series-season.model';
import { SeriesEpisode } from '../../models/series-episode.model';
import { updateOrAddSeriesAction } from '../../reducers/series.reducer';
import { updateOrAddMutlipleSeriesSeasonAction } from '../../reducers/series-season.reducer';
import { updateOrAddMultipleSeriesEpisodeAction } from '../../reducers/series-episode.reducer';
import { getSeriesMetaInfo } from '../../selectors/series-meta-info.selector';
import { SeriesMetaInfo } from '../../models/series-meta-info.model';
import { getSeriesByKey } from '../../selectors/series.selector';
import { getSeriesSeasonForEpisode } from '../../selectors/series-season.selector';
import { loadingDetailedSeriesInformation } from '../../actions/async-interactions';
import { addAsyncInteractionAction, removeAsyncInteractionAction } from '../../reducers/control-state.reducer';

export function* loadDetailedSeriesInformationFromApiSaga(action: ReturnType<typeof setSelectedSeriesAction>) {
    const { selectedSeriesKey } = action.payload;
    const asyncInteraction = loadingDetailedSeriesInformation({ seriesKey: selectedSeriesKey });
    yield put(addAsyncInteractionAction(asyncInteraction));
    try {
        let state = yield select();
        const stateSeries: SeriesMetaInfo = getSeriesMetaInfo(state, selectedSeriesKey);
        const [ series, seasons, episodes ]: [ Series, SeriesSeason[], SeriesEpisode[] ] = yield call(
            MovieDBService.getDetailedSeriesInformation,
            stateSeries.apiKeys[MovieApi.TMDB],
            state.options.defaultLanguage,
        );

        yield put(updateOrAddSeriesAction(series));
        yield put(updateOrAddMutlipleSeriesSeasonAction(seasons));
        yield put(updateOrAddMultipleSeriesEpisodeAction(episodes));

        state = yield select();

        const seriesFromState = getSeriesByKey(state, selectedSeriesKey);
        let seasonKey = seasons[0]?.key;

        if (seriesFromState.lastEpisodeWatched) {
            const season = getSeriesSeasonForEpisode(state, seriesFromState.lastEpisodeWatched);
            seasonKey = season.key;
        }

        yield put(setSelectedSeasonForAppAction(seasonKey));
    } catch (error) {
        Logger.error('[loadSeriesStartPageContentSaga] error occurred', error);
    } finally {
        yield put(removeAsyncInteractionAction(asyncInteraction.key));
    }
}
