import {
    setActivePortalForAppAction,
    setSelectedSeasonForAppAction,
    toggleSelectedSeriesForAppAction
} from '../reducers/app-control-state.reducer';
import { getPortalController, getSeriesService } from '../../background/container/container.utils';
import { call, put, select } from 'redux-saga/effects';
import { StateModel } from '../models/state.model';
import { getSeriesSeasonByKey } from '../selectors/series-season.selector';
import { getSeriesByKey } from '../selectors/series.selector';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { mapSeriesInfoDtoToSeries } from '../utils/series.utils';
import { updateOrAddMultipleSeriesAction } from '../reducers/series.reducer';

export function* loadAllSeriesForPortal(action: ReturnType<typeof setActivePortalForAppAction>) {
    if (action.payload) {
        const portalController = getPortalController();

        const seriesMetaInfo: SeriesInfoDto[] = yield call([ portalController, portalController.getAllSeriesFromPortal ], action.payload);

        const series = seriesMetaInfo.map(mapSeriesInfoDtoToSeries);

        yield put(updateOrAddMultipleSeriesAction(series));
    }
}


export function* loadDetailedSeriesInformation(action: ReturnType<typeof toggleSelectedSeriesForAppAction>) {
    const state: StateModel = yield select();
    const { selectedSeriesKey, activePortal } = state.appControlState;
    if (!selectedSeriesKey) {
        return;
    }

    let portalToUse = activePortal;

    if (!portalToUse) {
        const series = getSeriesByKey(state, selectedSeriesKey);

        portalToUse = series.lastUsedPortal;
    }

    const seriesService = getSeriesService();

    yield seriesService.updateSeriesForPortal(action.payload, portalToUse);
}


export function* loadDetailedSeasonInformation(action: ReturnType<typeof setSelectedSeasonForAppAction>) {
    const state: StateModel = yield select();
    let portal = state.appControlState.activePortal;
    if (!portal) {
        const season = getSeriesSeasonByKey(state, action.payload);
        const series = getSeriesByKey(state, season.seriesKey);

        portal = series.lastUsedPortal;
    }

    const seriesService = getSeriesService();

    yield seriesService.updateSeasonForPortal(action.payload, portal);
}



