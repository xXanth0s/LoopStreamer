import { setSelectedLanguageAction, setSelectedSeasonForAppAction } from '../reducers/app-control-state.reducer';
import { StateModel } from '../models/state.model';
import { call, put, select } from 'redux-saga/effects';
import {
    getAvailableLanguagesForSeasonAndActivePortal,
    getSeriesSeasonByKey
} from '../selectors/series-season.selector';
import { getSeriesByKey, getSeriesForSeason } from '../selectors/series.selector';
import { PORTALS } from '../enums/portals.enum';
import { getPortalController } from '../../background/container/container.utils';
import { mapSeriesEpisodeDtoToSeriesEpisode, mapSeriesSeasonDtoToSeriesSeason } from '../utils/series.utils';
import { updateOrAddMultipleSeriesEpisodeAction } from '../reducers/series-episode.reducer';
import { SeriesSeason } from '../models/series-season.model';
import { generateLinkForSeriesEpisodeDto, generateLinksForSeriesSeasonDto } from '../utils/link.utils';
import { LINK_TYPE } from '../enums/link-type.enum';
import { updateOrAddMultipleLinksAction } from '../reducers/link.reducer';
import { SeriesSeasonDto } from '../../dto/series-season.dto';
import { LANGUAGE } from '../enums/language.enum';
import { getLinksForSeriesSeasonAndPortal } from '../selectors/línk.selector';
import { loadSeriesInformationForPortal } from './load-series.saga';
import { updateOrAddSeriesSeasonAction } from '../reducers/series-season.reducer';
import { LinkModel } from '../models/link.model';

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

    yield setSelectedLanguageForSeasonAndPortal(seasonKey);

    const state: StateModel = yield select();
    let portal = state.appControlState.activePortal;
    const season = getSeriesSeasonByKey(state, seasonKey);
    const series = getSeriesByKey(state, season.seriesKey);
    if (!portal) {
        portal = series.lastUsedPortal;
    }

    yield updateSeasonInformationForPortal({
        seasonKey: action.payload,
        portalKey: portal,
        language: state.appControlState.selectedLanguage,
    });
}

export function* updateSeasonInformationForPortal(options: loadSeasonInformationOptions) {
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
        return yield updateSeasonInformationForPortal({ ...options, isSeriesUpToDate: true });
    }

    let linkForLanguage = links.find(link => link.language === finalLanguage);

    if (!linkForLanguage) {
        if (isSeasonUpToData) {
            return false;
        }
        yield updateSeriesInfoForLink(seasonKey, links[0]);
        return yield updateSeasonInformationForPortal({ ...options, isSeasonUpToData: true });
    }

    return yield updateSeriesInfoForLink(seasonKey, links[0]);
}

function* updateSeriesInfoForLink(seasonKey: SeriesSeason['key'], link: LinkModel) {
    const season = getSeriesSeasonByKey(yield select(), seasonKey);
    const portalController = getPortalController();

    const seasonData: SeriesSeasonDto = yield call([ portalController, portalController.getSeasonInfoForLink ], link, season.seasonNumber);

    yield yield addSeasonDataToStore(seasonData);
}

function* addSeasonDataToStore(seasonData: SeriesSeasonDto) {
    if (!seasonData || seasonData.episodes.length === 0) {
        return false;
    }

    const convertedSeason = mapSeriesSeasonDtoToSeriesSeason(seasonData);
    yield put(updateOrAddSeriesSeasonAction(convertedSeason));

    const seasonLinks = generateLinksForSeriesSeasonDto(seasonData);
    yield put(updateOrAddMultipleLinksAction(seasonLinks));

    const convertedEpisodes = seasonData.episodes.map(mapSeriesEpisodeDtoToSeriesEpisode);
    yield put(updateOrAddMultipleSeriesEpisodeAction(convertedEpisodes));

    const episodeLinks = seasonData.episodes.map(episode => generateLinkForSeriesEpisodeDto(episode, LINK_TYPE.PORTAL_EPISODE_LINK)).flat();
    yield put(updateOrAddMultipleLinksAction(episodeLinks));

    return true;
}


export function* setSelectedLanguageForSeasonAndPortal(seasonKey: SeriesSeason['key']) {
    const state: StateModel = yield select();
    const { selectedLanguage } = state.appControlState;
    const { defaultLanguage } = state.options;
    const languages = getAvailableLanguagesForSeasonAndActivePortal(yield select(), seasonKey);
    const series = getSeriesForSeason(yield select(), seasonKey);

    if (languages.length === 0) {
        return;
    }

    if (languages.find(language => language === selectedLanguage)) {
        return;
    }

    if (languages.find(language => language === series.lastUsedLanguage)) {
        yield put(setSelectedLanguageAction({ selectedLanguage: series.lastUsedLanguage }));
    }

    if (languages.find(language => language === defaultLanguage)) {
        yield put(setSelectedLanguageAction({ selectedLanguage: defaultLanguage }));
    }

    yield put(setSelectedLanguageAction({ selectedLanguage: languages[0] }));
}
