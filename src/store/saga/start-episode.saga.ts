import { startEpisodeAction } from '../actions/shared.actions';
import { getSeriesEpisodeByKey } from '../selectors/series-episode.selector';
import { call, put, select } from 'redux-saga/effects';
import { StateModel } from '../models/state.model';
import { getPortalController, getVideoController } from '../../background/container/container.utils';
import SeriesEpisode from '../models/series-episode.model';
import { PORTALS } from '../enums/portals.enum';
import { getAllUsedProvidors } from '../selectors/providors.selector';
import { PROVIDORS } from '../enums/providors.enum';
import { ProvidorLink } from '../../background/models/providor-link.model';
import { getSeriesForEpisode } from '../selectors/series.selector';
import { setLastUsedLanguageForSeriesAction, setLastUsedPortalForSeriesAction } from '../reducers/series.reducer';
import {
    raisePlayedEpisodesAction,
    resetPlayedEpisodesAction,
    setActiveEpisodeAction
} from '../reducers/control-state.reducer';
import { stopPlayer } from '../utils/stop-player.util';
import { getLinksByKeys } from '../selectors/línk.selector';
import { loadAllProvidorLinksForEpisode } from './load-series-data/load-all-providors-for-episode.saga';
import { LANGUAGE } from '../enums/language.enum';
import { generateLinkForProvidorLink } from '../utils/link.utils';
import { LINK_TYPE } from '../enums/link-type.enum';
import { updateOrAddLinkAction } from '../reducers/link.reducer';


export function* startEpisodeSaga(action: ReturnType<typeof startEpisodeAction>) {
    stopPlayer();
    const episodeKey = action.payload;

    yield put(resetPlayedEpisodesAction());

    const episodeStartSuccessful: boolean = yield startEpisode(episodeKey);

    if (episodeStartSuccessful) {
        yield put(raisePlayedEpisodesAction());
    }
}

export function* startEpisode(episodeKey: SeriesEpisode['key'], fetchPortalLinks: boolean = true, language: LANGUAGE = LANGUAGE.GERMAN) {
    const usedProvidors = [];
    const state: StateModel = yield select();
    const series = getSeriesForEpisode(state, episodeKey);

    yield put(setActiveEpisodeAction(episodeKey));

    const portal = state.appControlState.activePortal ? state.appControlState.activePortal : series.lastUsedPortal;

    let providorLink: ProvidorLink = yield getPrivodorLinkForEpisode(episodeKey, portal, []);
    while (providorLink) {
        const episodeStarted: boolean = yield startVideo(episodeKey, providorLink, portal, language);
        if (episodeStarted) {
            return true;
        }
        usedProvidors.push(providorLink.providor);
        providorLink = yield getPrivodorLinkForEpisode(episodeKey, portal, usedProvidors);
    }

    if (fetchPortalLinks) {
        yield loadAllProvidorLinksForEpisode(episodeKey, portal, LANGUAGE.GERMAN);
        return yield startEpisode(episodeKey, false);
    }

    // TODO show error message

    yield put(setActiveEpisodeAction(null));
    return false;
}

function* startVideo(episodeKey: SeriesEpisode['key'], providorLink: ProvidorLink, linkSourcePortal: PORTALS, language: LANGUAGE) {
    const videoController = getVideoController();
    const series = getSeriesForEpisode(yield select(), episodeKey);
    const success = yield call([ videoController, videoController.startVideo ], episodeKey, providorLink);
    if (success) {
        const link = generateLinkForProvidorLink(episodeKey, providorLink, language, LINK_TYPE.PROVIDER_LINK);
        yield put(updateOrAddLinkAction(link));
        yield put(setLastUsedPortalForSeriesAction({ seriesKey: series.key, portal: linkSourcePortal }));
        yield put(setLastUsedLanguageForSeriesAction({ seriesKey: series.key, language }));
        return true;
    }

    return success;
}

function* getPrivodorLinkForEpisode(episodeKey: SeriesEpisode['key'], portalKey: PORTALS, providersToIgnore: PROVIDORS[]) {
    const portalController = getPortalController();

    const state: StateModel = yield select();
    const seriesEpisode = getSeriesEpisodeByKey(state, episodeKey);

    const providors = getAllUsedProvidors(state).filter(providor => !providersToIgnore.includes(providor.key));
    const episodeProvidorLinks = getLinksByKeys(yield select(), seriesEpisode.providorLinks);

    for (const provider of providors) {
        const providorLink = episodeProvidorLinks.find(link => link.providor === provider.key);
        if (providorLink) {
            const result: ProvidorLink = {
                link: providorLink.href,
                providor: provider.key
            };

            return result;
        }

        const link: ProvidorLink = yield call([ portalController, portalController.getProvidorLinkForEpisode ], episodeKey, portalKey, provider.key);

        if (link) {
            return link;
        }
    }

    return null;
}
