import { all, call, put, select } from 'redux-saga/effects';
import { setSelectedSeasonForAppAction } from '../../reducers/app-control-state.reducer';
import { getSeriesSeasonByKey } from '../../selectors/series-season.selector';
import { PORTALS } from '../../enums/portals.enum';
import { getPortalController } from '../../../background/container/container.utils';
import { SeriesSeason } from '../../models/series-season.model';
import { PortalSeriesSeasonDto } from '../../../dto/portal-series-season.dto';
import { LANGUAGE } from '../../enums/language.enum';
import { getLinksForSeriesSeasonAndPortal, isSeasonUpToDate } from '../../selectors/línk.selector';
import { LinkModel } from '../../models/link.model';
import { addSeriesSeasonSaga } from '../add-data/add-series-season.saga';
import { generateAsyncInteraction } from '../../utils/async-interaction.util';
import { AsyncInteractionType } from '../../enums/async-interaction-type.enum';
import { addAsyncInteractionAction, removeAsyncInteractionAction } from '../../reducers/control-state.reducer';
import { Logger } from '../../../shared/services/logger';
import { loadSeriesInformationForPortalSaga } from './load-series.saga';
import { getSeriesForSeason } from '../../selectors/series.selector';

export function* loadSeasonInformationFromPortalSaga(action: ReturnType<typeof setSelectedSeasonForAppAction>) {
    const seasonKey = action.payload;
    const portal = PORTALS.BS;
    const asyncInteraction = generateAsyncInteraction(AsyncInteractionType.SAGA_LOADING_SEASON, { seasonKey });
    yield put(addAsyncInteractionAction(asyncInteraction));

    try {
        yield updateSeriesSeasonForPortal(seasonKey, portal);

        const languages = getLinksForSeriesSeasonAndPortal(yield select(), seasonKey, portal).map(link => link.language);

        yield all(languages.map(language => updateSeriesSeasonForPortal(seasonKey, portal, language)));
    } catch (error) {
        Logger.error('[loadSeasonInformationSaga] error occurred', error);
    } finally {
        yield put(removeAsyncInteractionAction(asyncInteraction.key));
    }
}

/*
    Loads and stores season information. It also checks, if series is available and updates series, if necessary
    @return boolean, if update was successfull
 */
export function* updateSeriesSeasonForPortal(seasonKey: SeriesSeason['key'], portalKey: PORTALS, language?: LANGUAGE) {
    const state = yield select();
    let links = getLinksForSeriesSeasonAndPortal(yield select(), seasonKey, portalKey);
    if (links.length === 0) {
        const series = getSeriesForSeason(state, seasonKey);
        yield loadSeriesInformationForPortalSaga(series.key, portalKey);
        links = getLinksForSeriesSeasonAndPortal(yield select(), seasonKey, portalKey);
    }

    let linkForLanguage: LinkModel;
    if (!language) {
        linkForLanguage = links[0];
    } else if (links.some(link => link.language === language)) {
        linkForLanguage = links.find(link => link.language === language);
    }

    if (!linkForLanguage) {
        return false;
    }

    yield updateSeriesSeasonForLink(seasonKey, linkForLanguage);
    return true;
}

function* updateSeriesSeasonForLink(seasonKey: SeriesSeason['key'], link: LinkModel) {
    const state = yield select();
    const isSeasonStateUpToDate = isSeasonUpToDate(state, seasonKey, link.portal, link.language);
    if (isSeasonStateUpToDate) {
        return;
    }

    const season = getSeriesSeasonByKey(state, seasonKey);
    const portalController = getPortalController();
    const portalDataData: PortalSeriesSeasonDto = yield call([ portalController, portalController.getSeasonInfoForLink ], link, season.seasonNumber);

    yield addSeriesSeasonSaga(season, portalDataData);
}
