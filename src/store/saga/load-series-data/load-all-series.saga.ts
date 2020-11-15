import { setActivePortalForAppAction } from '../../reducers/app-control-state.reducer';
import { getPortalController } from '../../../background/container/container.utils';
import { SeriesInfoDto } from '../../../dto/series-info.dto';
import { call } from 'redux-saga/effects';
import { addMultipleSeriesSaga } from '../add-data/add-series.saga';

export function* loadAllSeriesForPortal(action: ReturnType<typeof setActivePortalForAppAction>) {
    if (action.payload) {
        const portalController = getPortalController();

        const seriesMetaInfo: SeriesInfoDto[] = yield call([ portalController, portalController.getAllSeriesFromPortal ], action.payload);

        yield addMultipleSeriesSaga(seriesMetaInfo);
    }
}

