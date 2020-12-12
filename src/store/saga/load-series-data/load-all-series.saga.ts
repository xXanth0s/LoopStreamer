import { setActivePortalForAppAction } from '../../reducers/app-control-state.reducer';
import { getPortalController } from '../../../background/container/container.utils';
import { PortalSeriesInfoDto } from '../../../dto/portal-series-info.dto';
import { call, put } from 'redux-saga/effects';
import { addMultipleSeriesSaga } from '../add-data/add-series.saga';
import { generateAsyncInteraction } from '../../store/async-interaction.util';
import { AsyncInteractionType } from '../../enums/async-interaction-type.enum';
import { addAsyncInteractionAction, removeAsyncInteractionAction } from '../../reducers/control-state.reducer';
import { Logger } from '../../../shared/services/logger';

export function* loadAllSeriesForPortalSaga(action: ReturnType<typeof setActivePortalForAppAction>) {
    const portal = action.payload;
    if (portal) {


        const asyncInteraction = generateAsyncInteraction(AsyncInteractionType.SAGA_LOADING_ALL_SERIES, { portal });
        yield put(addAsyncInteractionAction(asyncInteraction));

        try {
            const portalController = getPortalController();

            const seriesMetaInfo: PortalSeriesInfoDto[] = yield call([ portalController, portalController.getAllSeriesFromPortal ], action.payload);

            yield addMultipleSeriesSaga(seriesMetaInfo);
        } catch (error) {
            Logger.error('[loadAllSeriesForPortalSaga] error occurred', error);
        } finally {
            yield put(removeAsyncInteractionAction(asyncInteraction.key));
        }
    }
}

