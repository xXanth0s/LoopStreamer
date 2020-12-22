import { call, put, select } from 'redux-saga/effects';
import { getPortalController } from '../../../background/container/container.utils';
import { PortalSeriesInfoDto } from '../../../dto/portal-series-info.dto';
import { PORTALS } from '../../enums/portals.enum';
import Series from '../../models/series.model';
import { addSeriesLinksToStoreSaga } from '../add-data/add-series-links-to-store.saga';
import { addAsyncInteractionAction, removeAsyncInteractionAction } from '../../reducers/control-state.reducer';
import { Logger } from '../../../shared/services/logger';
import { getLinkForSeriesAndPortal, isSeriesUpToDate } from '../../selectors/línk.selector';
import { LinkModel } from '../../models/link.model';
import { generateLinkForSeries } from '../../utils/link.utils';
import { updateOrAddLinkAction } from '../../reducers/link.reducer';
import { loadingSeriesAsyncInteraction } from '../../actions/async-interactions';


/*
    Loads and stores all Links for Series with Seasons
    @return: Boolean, if series could be loaded successfully
 */
export function* loadSeriesInformationForPortalSaga(seriesKey: string, portalKey: PORTALS) {
    if (isSeriesUpToDate(yield select(), seriesKey, portalKey)) {
        return true;
    }

    const link: LinkModel = yield getSeriesLinkForPortalSaga(seriesKey, portalKey);
    if (!link) {
        return false;
    }

    const asyncInteraction = loadingSeriesAsyncInteraction({
        seriesKey,
        portalKey,
    });
    yield put(addAsyncInteractionAction(asyncInteraction));

    try {
        return yield loadCompleteSeriesInformationForPortal(seriesKey, portalKey);
    } catch (error) {
        Logger.error('[loadSeriesInformationForPortalSaga] error occurred', error);
    } finally {
        yield put(removeAsyncInteractionAction(asyncInteraction.key));
    }

    return false;
}

export function* loadCompleteSeriesInformationForPortal(seriesKey: Series['key'], portalKey: PORTALS) {
    const portalController = getPortalController();
    const seriesInfo: PortalSeriesInfoDto = yield call([ portalController, portalController.getDetailedSeriesInformation ], seriesKey, portalKey);
    if (!seriesInfo) {
        return false;
    }

    yield addSeriesLinksToStoreSaga(seriesInfo, seriesKey);

    return true;
}

/*
    Loads and stores main link for Series
    @return: LinkModel | null
 */
function* getSeriesLinkForPortalSaga(seriesKey: string, portalKey: PORTALS) {
    const state = yield select();
    const link = getLinkForSeriesAndPortal(state, seriesKey, portalKey);
    if (link) {
        return link;
    }

    const portalController = getPortalController();
    try {
        const seriesLink: string = yield call([ portalController, portalController.getSeriesLinkForPortal ], seriesKey, portalKey);

        if (seriesLink) {
            const link = generateLinkForSeries(seriesKey, portalKey, seriesLink);

            yield put(updateOrAddLinkAction(link));
            return link;
        }

        return null;
    } catch (error) {
        Logger.error('[getSeriesLinkForPortal] error occurred', error);
    }
}


