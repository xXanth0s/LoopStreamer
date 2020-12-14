import { call, put, select } from 'redux-saga/effects';
import { setSelectedSeasonForAppAction } from '../../reducers/app-control-state.reducer';
import { StateModel } from '../../models/state.model';
import { getSeriesSeasonByKey } from '../../selectors/series-season.selector';
import { getSeriesByKey } from '../../selectors/series.selector';
import { PORTALS } from '../../enums/portals.enum';
import { getPortalController } from '../../../background/container/container.utils';
import { SeriesSeason } from '../../models/series-season.model';
import { PortalSeriesSeasonDto } from '../../../dto/portal-series-season.dto';
import { LANGUAGE } from '../../enums/language.enum';
import { getLinksForSeriesSeasonAndPortal } from '../../selectors/línk.selector';
import { loadSeriesInformationForPortal } from './load-series.saga';
import { LinkModel } from '../../models/link.model';
import { addSeriesSeasonSaga } from '../add-data/add-series-season.saga';
import { setActiveLanguageForSeasonAndPortal } from '../set-active-language.saga';
import { generateAsyncInteraction } from '../../utils/async-interaction.util';
import { AsyncInteractionType } from '../../enums/async-interaction-type.enum';
import { addAsyncInteractionAction, removeAsyncInteractionAction } from '../../reducers/control-state.reducer';
import { Logger } from '../../../shared/services/logger';

export type loadSeasonInformationOptions = {
    seasonKey: SeriesSeason['key'];
    portalKey: PORTALS;
    language?: LANGUAGE;
    isSeriesUpToDate?: boolean;
    isSeasonUpToData?: boolean;
}

export function* loadSeasonInformationSaga(action: ReturnType<typeof setSelectedSeasonForAppAction>) {
    const seasonKey = action.payload;
    const state: StateModel = yield select();
    if (!seasonKey || !state.appControlState.selectedSeason) {
        return;
    }

    yield setActiveLanguageForSeasonAndPortal(seasonKey);

    let portal = state.appControlState.activePortal;
    const season = getSeriesSeasonByKey(state, seasonKey);
    const series = getSeriesByKey(state, season.seriesKey);
    if (!portal) {
        portal = series.lastUsedPortal;
    }

    const lastUsedLanguage = series.lastUsedLanguage || LANGUAGE.NONE;
    const language = state.appControlState.selectedLanguage === LANGUAGE.NONE ? lastUsedLanguage : LANGUAGE.NONE;

    const asyncInteraction = generateAsyncInteraction(AsyncInteractionType.SAGA_LOADING_SEASON, { season });
    yield put(addAsyncInteractionAction(asyncInteraction));

    try {
        yield updateSeriesSeasonForPortal({
            seasonKey: action.payload,
            portalKey: portal,
            language,
        });
    } catch (error) {
        Logger.error('[loadSeasonInformationSaga] error occurred', error);
    } finally {
        yield put(removeAsyncInteractionAction(asyncInteraction.key));
    }

    yield setActiveLanguageForSeasonAndPortal(seasonKey);
}

export function* updateSeriesSeasonForPortal(options: loadSeasonInformationOptions) {
    const {
        isSeasonUpToData, isSeriesUpToDate, language, portalKey, seasonKey,
    } = options;
    const state: StateModel = yield select();
    const finalLanguage = language || state.options.defaultLanguage;
    const season = getSeriesSeasonByKey(state, seasonKey);
    const links = getLinksForSeriesSeasonAndPortal(state, seasonKey, portalKey);
    if (links.length === 0) {
        if (isSeriesUpToDate) {
            return false;
        }
        yield loadSeriesInformationForPortal(season.seriesKey, portalKey);
        return yield updateSeriesSeasonForPortal({ ...options, isSeriesUpToDate: true });
    }

    const linkForLanguage = links.find(link => link.language === finalLanguage);

    if (!linkForLanguage || language === LANGUAGE.NONE) {
        if (isSeasonUpToData) {
            return false;
        }
        yield updateSeriesSeasonForLink(seasonKey, links[0]);
        return yield updateSeriesSeasonForPortal({ ...options, isSeasonUpToData: true });
    }

    return yield updateSeriesSeasonForLink(seasonKey, linkForLanguage);
}

function* updateSeriesSeasonForLink(seasonKey: SeriesSeason['key'], link: LinkModel) {
    const season = getSeriesSeasonByKey(yield select(), seasonKey);
    const portalController = getPortalController();
    const seasonData: PortalSeriesSeasonDto = yield call([ portalController, portalController.getSeasonInfoForLink ], link, season.seasonNumber);

    yield addSeriesSeasonSaga(seasonData);
}
