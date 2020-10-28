import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import SeriesEpisode from '../models/series-episode.model';
import { StateModel } from '../models/state.model';
import { ProvidorLink } from '../../background/models/providor-link.model';
import Series from '../models/series.model';
import Providor from '../models/providor.model';
import { filterObject } from '../utils/selector.utils';
import { deleteSeriesAction } from '../actions/shared.actions';


const initialState: StateModel['seriesEpisodes'] = {};

const updateOrAddSeriesEpisode = function (state: StateModel['seriesEpisodes'], seriesEpisode: SeriesEpisode): void {

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

const updateOrAddMultipleSeriesEpisode = function (state: StateModel['seriesEpisodes'], seriesEpisodes: SeriesEpisode[]): void {
    seriesEpisodes.forEach(episode => updateOrAddSeriesEpisode(state, episode));
};


function addProvidorLinkToEpisode(state: StateModel['seriesEpisodes'], { payload }: PayloadAction<{ episodeKey: string; providorLink: ProvidorLink }>) {
    const { episodeKey, providorLink } = payload;

    const episode = state[episodeKey];
    if (!episode) {
        console.error(`[addProvidorLinkToEpisodeReducer]: no episode found for key: ${episodeKey}`);
        return;
    }

    episode.providorLinks[providorLink.providor] = providorLink.link;
}

function setSeriesEpisodeFinished(state: StateModel['seriesEpisodes'], episodeKey: SeriesEpisode['key']): void {
    // @ts-ignore
    state[episodeKey]?.isFinished = true;
}

function setSeriesEpisodeStarted(state: StateModel['seriesEpisodes'],
                                 { seriesEpisodeKey, duration }: { seriesEpisodeKey: SeriesEpisode['key'], duration: SeriesEpisode['duration'] }): void {
    const episode = state[seriesEpisodeKey];
    if (!episode) {
        console.error(`[SeriesEpisodeReducer->setSeriesEpisodeStarted]: no episode found for key: ${seriesEpisodeKey}`);
        return;
    }

    episode.isFinished = false;
    episode.duration = duration;
}

function setTimestamp(state: StateModel['seriesEpisodes'], { seriesEpisodeKey, timestamp }: { seriesEpisodeKey: SeriesEpisode['key']; timestamp: number }) {
    if (!state[seriesEpisodeKey]) {
        console.error(`[SeriesEpisodeReducer -> setTimestamp]: series for key ${seriesEpisodeKey} not found`);
        return;
    }

    state[seriesEpisodeKey].timestamp = timestamp;
}

function removeProvidorLinkFromEpisode(state: StateModel['seriesEpisodes'], action: PayloadAction<{ episodeKey: string; providorKey: Providor['key'] }>) {
    const { providorKey, episodeKey } = action.payload;

    delete state[episodeKey]?.providorLinks[providorKey];
}

function deleteAllEpisodesFromSeries(state: StateModel['seriesEpisodes'], seriesKey: string): StateModel['seriesEpisodes'] {
    return filterObject(state, episode => episode.seriesKey !== seriesKey);
}

const seriesEpisodesReducer = createSlice({
    name: 'seriesEpisodes',
    initialState,
    reducers: {
        updateOrAddSeriesEpisodeAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<SeriesEpisode>) =>
            updateOrAddSeriesEpisode(state, action.payload),
        updateOrAddMultipleSeriesEpisodeAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<SeriesEpisode[]>) =>
            updateOrAddMultipleSeriesEpisode(state, action.payload),
        addProvidorLinkToEpisodeAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<{ episodeKey: string, providorLink: ProvidorLink }>) =>
            addProvidorLinkToEpisode(state, action),
        removeProvidorLinkFromEpisodeAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<{ episodeKey: string, providorKey: Providor['key'] }>) =>
            removeProvidorLinkFromEpisode(state, action),
        setTimestampForSeriesEpisodeAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<{ seriesEpisodeKey: SeriesEpisode['key'], timestamp: number }>) =>
            setTimestamp(state, action.payload),
        seriesEpisodeFinishedAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<SeriesEpisode['key']>) =>
            setSeriesEpisodeFinished(state, action.payload),
        seriesEpisodeStartedAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<{ seriesKey: Series['key'], seriesEpisodeKey: SeriesEpisode['key'], duration: SeriesEpisode['duration'] }>) =>
            setSeriesEpisodeStarted(state, action.payload),
    }, extraReducers: (builder) => {
        builder.addCase(deleteSeriesAction, (state: StateModel['seriesEpisodes'], action: PayloadAction<Series['key']>) =>
            deleteAllEpisodesFromSeries(state, action.payload))
    },
});

export const {
    updateOrAddSeriesEpisodeAction,
    updateOrAddMultipleSeriesEpisodeAction,
    addProvidorLinkToEpisodeAction,
    removeProvidorLinkFromEpisodeAction,
    seriesEpisodeFinishedAction,
    seriesEpisodeStartedAction,
    setTimestampForSeriesEpisodeAction
} = seriesEpisodesReducer.actions;


export default seriesEpisodesReducer;



