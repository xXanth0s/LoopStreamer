import { setSelectedSeasonForAppAction } from '../../reducers/app-control-state.reducer';
import { StateModel } from '../../models/state.model';
import { call, select } from 'redux-saga/effects';
import { getSeriesSeasonByKey } from '../../selectors/series-season.selector';
import { getSeriesByKey } from '../../selectors/series.selector';
import { PORTALS } from '../../enums/portals.enum';
import { getPortalController } from '../../../background/container/container.utils';
import { SeriesSeason } from '../../models/series-season.model';
import { SeriesSeasonDto } from '../../../dto/series-season.dto';
import { LANGUAGE } from '../../enums/language.enum';
import { getLinksForSeriesSeasonAndPortal } from '../../selectors/línk.selector';
import { loadSeriesInformationForPortal } from './load-series.saga';
import { LinkModel } from '../../models/link.model';
import { addSeriesSeasonSaga } from '../add-data/add-series-season.saga';
import { setActiveLanguageForSeasonAndPortal } from '../set-active-language.saga';

export type loadSeasonInformationOptions = {
    seasonKey: SeriesSeason['key'],
    portalKey: PORTALS,
    language?: LANGUAGE,
    isSeriesUpToDate?: boolean;
    isSeasonUpToData?: boolean;
}

export function* loadSeasonInformationSaga(action: ReturnType<typeof setSelectedSeasonForAppAction>) {
    const seasonKey = action.payload;
    if (!seasonKey) {
        return;
    }

    yield setActiveLanguageForSeasonAndPortal(seasonKey);

    const state: StateModel = yield select();
    let portal = state.appControlState.activePortal;
    const season = getSeriesSeasonByKey(state, seasonKey);
    const series = getSeriesByKey(state, season.seriesKey);
    if (!portal) {
        portal = series.lastUsedPortal;
    }

    yield updateSeriesSeasonForPortal({
        seasonKey: action.payload,
        portalKey: portal,
        language: state.appControlState.selectedLanguage,
    });
}

export function* updateSeriesSeasonForPortal(options: loadSeasonInformationOptions) {
    const { isSeasonUpToData, isSeriesUpToDate, language, portalKey, seasonKey } = options;
    const state: StateModel = yield select();
    const finalLanguage = language || state.options.defaultLanguage;
    const season = getSeriesSeasonByKey(state, seasonKey);
    let links = getLinksForSeriesSeasonAndPortal(state, seasonKey, portalKey);
    if (links.length === 0) {
        if (isSeriesUpToDate) {
            return false;
        }
        yield loadSeriesInformationForPortal(season.seriesKey, portalKey);
        return yield updateSeriesSeasonForPortal({ ...options, isSeriesUpToDate: true });
    }

    let linkForLanguage = links.find(link => link.language === finalLanguage);

    if (!linkForLanguage) {
        if (isSeasonUpToData) {
            return false;
        }
        yield updateSeriesSeasonForLink(seasonKey, links[0]);
        return yield updateSeriesSeasonForPortal({ ...options, isSeasonUpToData: true });
    }

    return yield updateSeriesSeasonForLink(seasonKey, links[0]);
}

function* updateSeriesSeasonForLink(seasonKey: SeriesSeason['key'], link: LinkModel) {
    const season = getSeriesSeasonByKey(yield select(), seasonKey);
    const portalController = getPortalController();

    const seasonData: SeriesSeasonDto = yield call([ portalController, portalController.getSeasonInfoForLink ], link, season.seasonNumber);

    yield addSeriesSeasonSaga(seasonData);
}


