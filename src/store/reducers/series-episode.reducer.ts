import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import SeriesEpisode from '../models/series-episode.model';
import { StateModel } from '../models/state.model';
import { ProvidorLink } from '../../background/models/providor-link.model';


const initialState: StateModel['seriesEpisodes'] = {};

const addSeriesEpisode = function (state: StateModel['seriesEpisodes'], seriesEpisode: SeriesEpisode): void {

    const oldEpisode = state[seriesEpisode.key];

    state[seriesEpisode.key] = {
        ...oldEpisode,
        ...seriesEpisode,
        portalLinks: {
            ...oldEpisode?.portalLinks,
            ...seriesEpisode.portalLinks,
        },
        providorLinks: {
            ...oldEpisode?.providorLinks,
            ...seriesEpisode.providorLinks,
        }
    };
};


function addProvidorLinkToEpisode(state: StateModel['seriesEpisodes'], { payload }: PayloadAction<{ episodeKey: string; providorLink: ProvidorLink }>) {
    const {episodeKey, providorLink} = payload;

    const episode = state[episodeKey];
    if(!episode) {
        console.error(`[addProvidorLinkToEpisodeReducer]: no episode found for key: ${episodeKey}`);
        return;
    }

    episode.portalLinks[providorLink.providor] = providorLink.link;
}

const seriesEpisodesReducer = createSlice({
    name: 'seriesEpisodes',
    initialState,
    reducers: {
        addSeriesEpisodeAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<SeriesEpisode>) => addSeriesEpisode(state, action.payload),
        addProvidorLinkToEpisodeAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<{episodeKey: string, providorLink: ProvidorLink}>) => addProvidorLinkToEpisode(state, action),
    },
});

export const {
    addSeriesEpisodeAction,
    addProvidorLinkToEpisodeAction
} = seriesEpisodesReducer.actions


export default seriesEpisodesReducer;



