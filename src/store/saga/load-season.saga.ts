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
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { mapSeriesEpisodeDtoToSeriesEpisode } from '../utils/series.utils';
import { updateOrAddMultipleSeriesEpisodeAction } from '../reducers/series-episode.reducer';
import { SeriesSeason } from '../models/series-season.model';
import { generateLinkForSeriesEpisodeDto } from '../utils/link.utils';
import { LINK_TYPE } from '../enums/link-type.enum';
import { updateOrAddMultipleLinksAction } from '../reducers/link.reducer';

export function* loadSeasonInformationSaga(action: ReturnType<typeof setSelectedSeasonForAppAction>) {
    const seasonKey = action.payload;
    if (!seasonKey) {
        return;
    }

    yield setSelectedLanguageForSeasonAndPortal(seasonKey);

    const state: StateModel = yield select();
    let portal = state.appControlState.activePortal;
    if (!portal) {
        const season = getSeriesSeasonByKey(state, seasonKey);
        const series = getSeriesByKey(state, season.seriesKey);

        portal = series.lastUsedPortal;
    }

    yield loadSeasonInformationForPortal(action.payload, portal);
    yield setSelectedLanguageForSeasonAndPortal(seasonKey);
}

export function* loadSeasonInformationForPortal(seasonKey: SeriesSeason['key'], portalKey: PORTALS) {
    const portalController = getPortalController();
    const seasonEpisodes: SeriesEpisodeDto[] = yield call([ portalController, portalController.getEpisodesForSeason ], seasonKey, portalKey);
    if (seasonEpisodes && seasonEpisodes.length > 0) {
        const episodes = seasonEpisodes.map(mapSeriesEpisodeDtoToSeriesEpisode);
        yield put(updateOrAddMultipleSeriesEpisodeAction(episodes));

        const links = seasonEpisodes.map(episode => generateLinkForSeriesEpisodeDto(episode, LINK_TYPE.PORTAL_EPISODE_LINK)).flat();
        yield put(updateOrAddMultipleLinksAction(links));

        return true;
    }

    return false;
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
