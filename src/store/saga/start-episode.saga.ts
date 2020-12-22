import { call, put, select } from 'redux-saga/effects';
import { startEpisodeAction } from '../actions/shared.actions';
import { getFallbackLanguageForEpisode, getSeriesEpisodeByKey } from '../selectors/series-episode.selector';
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
    addAsyncInteractionAction,
    raisePlayedEpisodesAction,
    removeAsyncInteractionAction,
    resetPlayedEpisodesAction,
    setActiveEpisodeAction,
} from '../reducers/control-state.reducer';
import { stopPlayer } from '../utils/stop-player.util';
import { getLinksByKeys } from '../selectors/línk.selector';
import { loadAllProvidorLinksForEpisode } from './portal-load-series-data/load-all-providors-for-episode.saga';
import { LANGUAGE } from '../enums/language.enum';
import { generateLinkForProvidorLink } from '../utils/link.utils';
import { LINK_TYPE } from '../enums/link-type.enum';
import { updateOrAddLinkAction } from '../reducers/link.reducer';
import { Logger } from '../../shared/services/logger';
import { startEpisodeAsyncInteraction } from '../actions/async-interactions';

export type StartEpisodeOptions = {
    episodeKey: SeriesEpisode['key'];
    language: LANGUAGE;
    fetchPortalLinks?: boolean;
}

const defaultConfig: StartEpisodeOptions = {
    episodeKey: '',
    fetchPortalLinks: true,
    language: LANGUAGE.NONE,
};

export function* startEpisodeSaga(action: ReturnType<typeof startEpisodeAction>) {
    stopPlayer();
    const { episodeKey, language } = action.payload;

    const languageToPlay = language || getFallbackLanguageForEpisode(yield select(), episodeKey);

    yield put(resetPlayedEpisodesAction());
    const episodeStartSuccessful: boolean = yield startEpisode({ episodeKey, language: languageToPlay });

    if (episodeStartSuccessful) {
        yield put(raisePlayedEpisodesAction());
    }

}

export function* startEpisode(options: StartEpisodeOptions) {
    const { episodeKey, language, fetchPortalLinks } = { ...defaultConfig, ...options };
    const asyncInteraction = startEpisodeAsyncInteraction({ episodeKey });
    yield put(addAsyncInteractionAction(asyncInteraction));
    yield put(setActiveEpisodeAction(episodeKey));

    try {
        const usedProvidors = [];

        const portal = PORTALS.BS;

        let providorLink: ProvidorLink = yield getPrivodorLinkForEpisode(episodeKey, portal, [], language);
        while (providorLink) {
            const episodeStarted: boolean = yield startVideo(episodeKey, providorLink, portal, language);
            if (episodeStarted) {
                return true;
            }
            usedProvidors.push(providorLink.providor);
            providorLink = yield getPrivodorLinkForEpisode(episodeKey, portal, usedProvidors, language);
        }

        if (fetchPortalLinks) {
            yield loadAllProvidorLinksForEpisode(episodeKey, portal, LANGUAGE.GERMAN);
            return yield startEpisode({ ...options, fetchPortalLinks: false });
        }

        yield put(setActiveEpisodeAction(null));
        return false;
    } catch (error) {
        Logger.error('[loadSeasonInformationSaga] error occurred', error);
    } finally {
        yield put(removeAsyncInteractionAction(asyncInteraction.key));
    }

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

function* getPrivodorLinkForEpisode(episodeKey: SeriesEpisode['key'], portalKey: PORTALS, providersToIgnore: PROVIDORS[], language: LANGUAGE) {
    const portalController = getPortalController();

    const state: StateModel = yield select();
    const seriesEpisode = getSeriesEpisodeByKey(state, episodeKey);

    const providors = getAllUsedProvidors(state).filter(providor => !providersToIgnore.includes(providor.key));
    const episodeProvidorLinks = getLinksByKeys(yield select(), seriesEpisode.providorLinks).filter(link => link.language === language);

    for (const provider of providors) {
        const providorLink = episodeProvidorLinks.find(link => link.providor === provider.key);
        if (providorLink) {
            const result: ProvidorLink = {
                link: providorLink.href,
                providor: provider.key,
            };

            return result;
        }

        const link: ProvidorLink = yield call([ portalController, portalController.getProvidorLinkForEpisode ], episodeKey, portalKey, provider.key, language);

        if (link) {
            return link;
        }
    }

    return null;
}
