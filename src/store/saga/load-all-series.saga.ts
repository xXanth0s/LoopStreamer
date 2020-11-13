import { setActivePortalForAppAction } from '../reducers/app-control-state.reducer';
import { getPortalController } from '../../background/container/container.utils';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { call, put } from 'redux-saga/effects';
import { mapSeriesInfoDtoToSeries } from '../utils/series.utils';
import { generateLinkForSeries } from '../utils/link.utils';
import { updateOrAddMultipleLinksAction } from '../reducers/link.reducer';
import { updateOrAddMultipleSeriesAction } from '../reducers/series.reducer';

export function* loadAllSeriesForPortal(action: ReturnType<typeof setActivePortalForAppAction>) {
    if (action.payload) {
        const portalController = getPortalController();

        const seriesMetaInfo: SeriesInfoDto[] = yield call([ portalController, portalController.getAllSeriesFromPortal ], action.payload);

        const series = seriesMetaInfo.map(mapSeriesInfoDtoToSeries);
        yield put(updateOrAddMultipleSeriesAction(series));

        const links = seriesMetaInfo.map(generateLinkForSeries);
        yield put(updateOrAddMultipleLinksAction(links));
    }
}

