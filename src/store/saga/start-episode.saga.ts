import { startEpisodeAction } from '../actions/shared.actions';
import { getSeriesEpisodeByKey } from '../selectors/series-episode.selector';
import { put, select } from 'redux-saga/effects';
import { StateModel } from '../models/state.model';
import { getSeriesByKey } from '../selectors/series.selector';
import { getPortalController, getSeriesService } from '../../background/container/container.helper';
import SeriesEpisode from '../models/series-episode.model';
import { PORTALS } from '../enums/portals.enum';
import { setActiveEpisodeAction } from '../reducers/control-state.reducer';
import { getAllUsedProvidors } from '../selectors/providors.selector';
import Providor from '../models/providor.model';
import {
    addProvidorLinkToEpisodeAction,
    removeProvidorLinkFromEpisodeAction
} from '../reducers/series-episode.reducer';
import { setLastUsedPortalForSeriesAction } from '../reducers/series.reducer';

export function* startEpisode(action: ReturnType<typeof startEpisodeAction>) {
    const {episodeKey, portalKey} = action.payload;

    let finalPortalKey = portalKey;
    const state: StateModel = yield select();
    const seriesEpisode = getSeriesEpisodeByKey(state, episodeKey);
    if (!finalPortalKey) {
        const series = getSeriesByKey(state, seriesEpisode.seriesKey);
        finalPortalKey = series.lastUsedPortal;
    }

    const seriesService = getSeriesService();
    seriesService.const
    episode = this.st

}


private async
startEpisode(episodeKey
:
SeriesEpisode['key'], portal
:
PORTALS
):
Promise < boolean > {
    this.store.dispatch(setActiveEpisodeAction(episodeKey));
    const episode = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);

    const usedProvidors = this.store.selectSync(getAllUsedProvidors);
    for(let provider of usedProvidors
)
{
    const result = this.startEpisodeForProvidor(episode, portal, provider);
    if (result) {
        return true;
    }
}

this.store.dispatch(setActiveEpisodeAction(null));
return false;
}


async function startNextEpisode(episodeKey: SeriesEpisode['key']): Promise<boolean> {
    const seriesService = getSeriesService();
    const nextEpisode = await seriesService.getNextEpisode(episodeKey);
    if (nextEpisode) {
        return this.startEpisode(nextEpisode.key, PORTALS.BS);
    }

    return false;
}

async function startEpisodeForProvidor(episode: SeriesEpisode, portal: PORTALS, providor: Providor): Promise<SeriesEpisode> {
    const episodeKey = episode.key;
    if (!episode.providorLinks[providor.key]) {
        const portalController = getPortalController();
        const providorLink = await portalController.getProvidorLinkForEpisode(episode.key, portal);

        if (providorLink.link) {
            this.store.dispatch(addProvidorLinkToEpisodeAction({episodeKey, providorLink}));
        } else {
            return false;
        }
    }

    const result = await this.videoController.startVideo(episodeKey, providor.key);

    if (!result) {
        this.store.dispatch(removeProvidorLinkFromEpisodeAction({
            episodeKey,
            providorKey: providor.key
        }));
    } else {
        this.store.dispatch(setLastUsedPortalForSeriesAction({
            seriesKey: episode.seriesKey,
            portal
        }));
    }

    return result;
}
