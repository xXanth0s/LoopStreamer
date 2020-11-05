import { startEpisodeAction } from '../actions/shared.actions';
import { getSeriesEpisodeByKey } from '../selectors/series-episode.selector';
import { call, put, select } from 'redux-saga/effects';
import { StateModel } from '../models/state.model';
import { getPortalController, getVideoController } from '../../background/container/container.utils';
import SeriesEpisode from '../models/series-episode.model';
import { PORTALS } from '../enums/portals.enum';
import { getAllUsedProvidors } from '../selectors/providors.selector';
import { addProvidorLinkToEpisodeAction } from '../reducers/series-episode.reducer';
import { PROVIDORS } from '../enums/providors.enum';
import { ProvidorLink } from '../../background/models/providor-link.model';
import { getSeriesByKey } from '../selectors/series.selector';
import { setLastUsedPortalForSeriesAction } from '../reducers/series.reducer';


export function* startEpisodeSaga(action: ReturnType<typeof startEpisodeAction>) {
    const episodeKey = action.payload;
    const videoController = getVideoController();
    const usedProvidors = [];
    const state: StateModel = yield select();
    const episode = getSeriesEpisodeByKey(state, episodeKey);
    const series = getSeriesByKey(state, episode.seriesKey);

    let portal = state.appControlState.activePortal;
    if (!portal) {

        portal = series.lastUsedPortal;
    }

    let providorLink: ProvidorLink = yield getPrivodorLinkForEpisode(episodeKey, portal, []);

    while (providorLink !== null) {

        const isVideoStartSuccessful: boolean = yield call([ videoController, videoController.startVideo ], episodeKey, providorLink);
        if (isVideoStartSuccessful) {
            yield put(addProvidorLinkToEpisodeAction({ episodeKey, providorLink }));
            yield put(setLastUsedPortalForSeriesAction({ seriesKey: series.key, portal }));
            break;
        }

        usedProvidors.push(providorLink.providor);
        providorLink = yield getPrivodorLinkForEpisode(episodeKey, portal, []);
    }
}

function* getPrivodorLinkForEpisode(episodeKey: SeriesEpisode['key'], portalKey: PORTALS, providersToIgnore: PROVIDORS[]) {
    const portalController = getPortalController();

    const state: StateModel = yield select();
    const seriesEpisode = getSeriesEpisodeByKey(state, episodeKey);

    const providors = getAllUsedProvidors(state).filter(providor => !providersToIgnore.includes(providor.key));

    for (const provider of providors) {
        if (seriesEpisode.providorLinks[provider.key]) {
            return seriesEpisode.providorLinks[provider.key];
        }

        const link: ProvidorLink = yield call([ portalController, portalController.getProvidorLinkForEpisode ], episodeKey, portalKey, provider.key);

        if (link) {
            return link;
        }
    }

    return null;
}
