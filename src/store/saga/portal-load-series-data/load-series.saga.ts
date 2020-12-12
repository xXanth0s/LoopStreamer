import { toggleSelectedSeriesForAppAction } from '../../reducers/app-control-state.reducer';
import { getPortalController } from '../../../background/container/container.utils';
import { call, put, select } from 'redux-saga/effects';
import { StateModel } from '../../models/state.model';
import { getSeriesByKey } from '../../selectors/series.selector';
import { PortalSeriesInfoDto } from '../../../dto/portal-series-info.dto';
import { PORTALS } from '../../enums/portals.enum';
import Series from '../../models/series.model';
import { addSeriesSaga } from '../add-data/add-series.saga';
import { generateAsyncInteraction } from '../../store/async-interaction.util';
import { AsyncInteractionType } from '../../enums/async-interaction-type.enum';
import { addAsyncInteractionAction, removeAsyncInteractionAction } from '../../reducers/control-state.reducer';
import { Logger } from '../../../shared/services/logger';

export function* loadSeriesInformationSaga(action: ReturnType<typeof toggleSelectedSeriesForAppAction>) {

    const state: StateModel = yield select();
    const seriesKey = action.payload;
    if (!seriesKey || !state.appControlState.selectedSeriesKey) {
        return;
    }

    let portalKey = state.appControlState.activePortal;

    const asyncInteraction = generateAsyncInteraction(AsyncInteractionType.SAGA_LOADING_SERIES, {
        seriesKey,
        portalKey
    });
    yield put(addAsyncInteractionAction(asyncInteraction));

    try {
        if (!portalKey) {
            const series = getSeriesByKey(state, seriesKey);
            portalKey = series.lastUsedPortal;
        }

        yield loadSeriesInformationForPortal(seriesKey, portalKey);
    } catch (error) {
        Logger.error('[loadSeriesInformationSaga] error occurred', error);
    } finally {
        yield put(removeAsyncInteractionAction(asyncInteraction.key));
    }
}

export function* loadSeriesInformationForPortal(seriesKey: Series['key'], portalKey: PORTALS) {
    const portalController = getPortalController();
    const seriesInfo: PortalSeriesInfoDto = yield call([ portalController, portalController.getDetailedSeriesInformation ], seriesKey, portalKey);
    if (!seriesInfo) {
        return false;
    }

    yield addSeriesSaga(seriesInfo, seriesKey);

    return true;
}
