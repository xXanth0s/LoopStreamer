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
import { getSeriesForEpisode } from '../selectors/series.selector';
import { setLastUsedPortalForSeriesAction } from '../reducers/series.reducer';
import { raisePlayedEpisodesAction, resetPlayedEpisodesAction } from '../reducers/control-state.reducer';
import { stopPlayer } from '../utils/stop-player.util';


export function* startEpisodeSaga(action: ReturnType<typeof startEpisodeAction>) {
    stopPlayer();
    const episodeKey = action.payload;

    yield put(resetPlayedEpisodesAction());

    const episodeStartSuccessful: boolean = yield startEpisode(episodeKey);

    if (episodeStartSuccessful) {
        yield put(raisePlayedEpisodesAction());
    }
}

export function* startEpisode(episodeKey: SeriesEpisode['key']) {
    const videoController = getVideoController();
    const usedProvidors = [];
    const state: StateModel = yield select();
    const series = getSeriesForEpisode(state, episodeKey);

    const portal = state.appControlState.activePortal ? state.appControlState.activePortal : series.lastUsedPortal;

    let providorLink: ProvidorLink = yield getPrivodorLinkForEpisode(episodeKey, portal, []);

    let success = false;
    while (providorLink !== null) {
        success = yield call([ videoController, videoController.startVideo ], episodeKey, providorLink);
        if (success) {
            yield put(addProvidorLinkToEpisodeAction({ episodeKey, providorLink }));
            yield put(setLastUsedPortalForSeriesAction({ seriesKey: series.key, portal }));
            break;
        }

        usedProvidors.push(providorLink.providor);
        providorLink = yield getPrivodorLinkForEpisode(episodeKey, portal, []);
    }

    return success;
}

function* getPrivodorLinkForEpisode(episodeKey: SeriesEpisode['key'], portalKey: PORTALS, providersToIgnore: PROVIDORS[]) {
    const portalController = getPortalController();

    const state: StateModel = yield select();
    const seriesEpisode = getSeriesEpisodeByKey(state, episodeKey);

    const providors = getAllUsedProvidors(state).filter(providor => !providersToIgnore.includes(providor.key));

    for (const provider of providors) {
        if (seriesEpisode.providorLinks[provider.key]) {
            const result: ProvidorLink = {
                link: seriesEpisode.providorLinks[provider.key],
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
