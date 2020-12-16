import { all, call, put, select } from 'redux-saga/effects';
import { setSelectedSeasonForAppAction } from '../../reducers/app-control-state.reducer';
import { getSeriesSeasonByKey } from '../../selectors/series-season.selector';
import { getSeriesForSeason } from '../../selectors/series.selector';
import { PORTALS } from '../../enums/portals.enum';
import { getPortalController } from '../../../background/container/container.utils';
import { SeriesSeason } from '../../models/series-season.model';
import { PortalSeriesSeasonDto } from '../../../dto/portal-series-season.dto';
import { LANGUAGE } from '../../enums/language.enum';
import { getLinksForSeriesSeasonAndPortal } from '../../selectors/línk.selector';
import { loadSeriesInformationForPortalSaga } from './load-series.saga';
import { LinkModel } from '../../models/link.model';
import { addSeriesSeasonSaga } from '../add-data/add-series-season.saga';
import { generateAsyncInteraction } from '../../utils/async-interaction.util';
import { AsyncInteractionType } from '../../enums/async-interaction-type.enum';
import { addAsyncInteractionAction, removeAsyncInteractionAction } from '../../reducers/control-state.reducer';
import { Logger } from '../../../shared/services/logger';
import { getDefaultLanguage } from '../../selectors/options.selector';

export function* loadSeasonInformationFromPortalSaga(action: ReturnType<typeof setSelectedSeasonForAppAction>) {
    const seasonKey = action.payload;
    const portal = PORTALS.BS;

    const asyncInteraction = generateAsyncInteraction(AsyncInteractionType.SAGA_LOADING_SEASON, { seasonKey });
    yield put(addAsyncInteractionAction(asyncInteraction));

    try {
        const defaultLanguage = getDefaultLanguage(yield select());
        const previousLanguages = getLinksForSeriesSeasonAndPortal(yield select(), seasonKey, portal).map(link => link.language);

        yield updateSeriesSeasonForPortal(seasonKey, portal, defaultLanguage);

        const newLanguages = getLinksForSeriesSeasonAndPortal(yield select(), seasonKey, portal).map(link => link.language);

        const languageDifferenece = newLanguages.filter(language => {
            return !previousLanguages.includes(language) || language !== defaultLanguage;
        });

        yield all(languageDifferenece.map(language => updateSeriesSeasonForPortal(seasonKey, portal, language)));
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
export function* updateSeriesSeasonForPortal(seasonKey: SeriesSeason['key'], portalKey: PORTALS, language: LANGUAGE) {
    const series = getSeriesForSeason(yield select(), seasonKey);
    let links = getLinksForSeriesSeasonAndPortal(yield select(), seasonKey, portalKey);
    if (links.length === 0) {

        yield loadSeriesInformationForPortalSaga(series.key, portalKey);

        links = getLinksForSeriesSeasonAndPortal(yield select(), seasonKey, portalKey);

        if (links.length === 0) {
            return false;
        }
    }

    let linkForLanguage = links.find(link => link.language === language);

    if (!linkForLanguage || language === LANGUAGE.NONE) {
        yield updateSeriesSeasonForLink(seasonKey, links[0]);
        links = getLinksForSeriesSeasonAndPortal(yield select(), seasonKey, portalKey);
        linkForLanguage = links.find(link => link.language === language);
        if (!linkForLanguage) {
            return false;
        }
    }

    yield updateSeriesSeasonForLink(seasonKey, linkForLanguage);
    return true;
}

function* updateSeriesSeasonForLink(seasonKey: SeriesSeason['key'], link: LinkModel) {
    const season = getSeriesSeasonByKey(yield select(), seasonKey);
    const portalController = getPortalController();
    const seasonData: PortalSeriesSeasonDto = yield call([ portalController, portalController.getSeasonInfoForLink ], link, season.seasonNumber);

    yield addSeriesSeasonSaga(seasonData);
}
