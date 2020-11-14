import { setSelectedLanguageAction, toggleSelectedSeriesForAppAction } from '../reducers/app-control-state.reducer';
import { getPortalController } from '../../background/container/container.utils';
import { call, put, select } from 'redux-saga/effects';
import { StateModel } from '../models/state.model';
import { getSeriesByKey } from '../selectors/series.selector';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { mapSeriesInfoDtoToSeries, mapSeriesInfoDtoToSeriesSeasons } from '../utils/series.utils';
import { updateOrAddSeriesAction } from '../reducers/series.reducer';
import { PORTALS } from '../enums/portals.enum';
import Series from '../models/series.model';
import { updateOrAddMutlipleSeriesSeasonAction } from '../reducers/series-season.reducer';
import { generateLinksForSeriesSeasonFromSeriesDto } from '../utils/link.utils';
import { updateOrAddMultipleLinksAction } from '../reducers/link.reducer';

export function* loadSeriesInformationSaga(action: ReturnType<typeof toggleSelectedSeriesForAppAction>) {
    const state: StateModel = yield select();
    const seriesKey = action.payload;
    if (!seriesKey) {
        return;
    }

    yield put(setSelectedLanguageAction({ selectedLanguage: null }));

    let portalKey = state.appControlState.activePortal;

    if (!portalKey) {
        const series = getSeriesByKey(state, seriesKey);

        portalKey = series.lastUsedPortal;
    }

    yield loadSeriesInformationForPortal(seriesKey, portalKey);
}

export function* loadSeriesInformationForPortal(seriesKey: Series['key'], portalKey: PORTALS) {
    const portalController = getPortalController();
    const seriesInfo: SeriesInfoDto = yield call([ portalController, portalController.getDetailedSeriesInformation ], seriesKey, portalKey);
    if (seriesInfo) {
        const series = mapSeriesInfoDtoToSeries(seriesInfo);
        yield put(updateOrAddSeriesAction(series));

        const seasons = mapSeriesInfoDtoToSeriesSeasons(seriesInfo);
        yield put(updateOrAddMutlipleSeriesSeasonAction(seasons));

        const links = generateLinksForSeriesSeasonFromSeriesDto(seriesInfo);
        yield put(updateOrAddMultipleLinksAction(links));
    }

    return Boolean(seriesInfo);
}
