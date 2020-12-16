import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import SeriesEpisode from '../models/series-episode.model';
import { StateModel } from '../models/state.model';
import Series from '../models/series.model';
import { filterObject } from '../utils/selector.utils';
import { deleteSeriesAction } from '../actions/shared.actions';
import { updateOrAddLinkAction, updateOrAddMultipleLinksAction } from './link.reducer';
import { LinkModel } from '../models/link.model';
import { LINK_TYPE } from '../enums/link-type.enum';
import { addToArrayIfNotExists } from '../../utils/array.utils';

const initialState: StateModel['seriesEpisodes'] = {};

const updateOrAddSeriesEpisode = function (state: StateModel['seriesEpisodes'], seriesEpisode: SeriesEpisode): void {
    const oldEpisode = state[seriesEpisode.key];

    if (!oldEpisode) {
        state[seriesEpisode.key] = seriesEpisode;
    } else {
        state[seriesEpisode.key] = {
            ...oldEpisode,
            ...seriesEpisode,
            portalLinks: [
                ...oldEpisode.portalLinks,
                ...seriesEpisode.portalLinks,
            ],
            providorLinks: [
                ...oldEpisode?.providorLinks,
                ...seriesEpisode.providorLinks,
            ],
        };
    }
};

const updateOrAddMultipleSeriesEpisode = function (state: StateModel['seriesEpisodes'], seriesEpisodes: SeriesEpisode[]): void {
    seriesEpisodes.forEach(episode => updateOrAddSeriesEpisode(state, episode));
};

function setSeriesEpisodeFinished(state: StateModel['seriesEpisodes'], payload: { seriesEpisodeKey: SeriesEpisode['key']; isFinished: boolean }): void {
    const { seriesEpisodeKey, isFinished } = payload;
    const episode = state[seriesEpisodeKey];
    if (!episode) {
        console.error(`[SeriesEpisodeReducer->setSeriesEpisodeFinished]: no episode found for key: ${seriesEpisodeKey}`);
        return;
    }

    episode.isFinished = isFinished;
}

function setSeriesEpisodeStarted(state: StateModel['seriesEpisodes'],
                                 { seriesEpisodeKey, duration }: { seriesEpisodeKey: SeriesEpisode['key']; duration: SeriesEpisode['duration'] }): StateModel['seriesEpisodes'] {
    const episode = state[seriesEpisodeKey];
    if (!episode) {
        console.error(`[SeriesEpisodeReducer->setSeriesEpisodeStarted]: no episode found for key: ${seriesEpisodeKey}`);
        return state;
    }

    return {
        ...state,
        [seriesEpisodeKey]: {
            ...episode,
            hasNextEpisode: false,
            hasPreviousEpisode: false,
            duration,
        },
    };
}

function setTimestamp(state: StateModel['seriesEpisodes'],
                      payload: { seriesEpisodeKey: SeriesEpisode['key']; timestamp: number }): StateModel['seriesEpisodes'] {
    const { seriesEpisodeKey, timestamp } = payload;
    const seriesEpisode = state[seriesEpisodeKey];
    if (!seriesEpisode) {
        console.error(`[SeriesEpisodeReducer -> setTimestamp]: series for key ${seriesEpisodeKey} not found`);
        return state;
    }

    return {
        ...state,
        [seriesEpisodeKey]: {
            ...seriesEpisode,
            timestamp,
        },
    };
}

function deleteAllEpisodesFromSeries(state: StateModel['seriesEpisodes'], seriesKey: string): StateModel['seriesEpisodes'] {
    return filterObject(state, episode => episode.seriesKey !== seriesKey);
}

function setNextEpisodeState(state: StateModel['seriesEpisodes'],
                             { seriesEpisodeKey, hasNextEpisode }: { seriesEpisodeKey: SeriesEpisode['key']; hasNextEpisode: boolean }) {
    const episode = state[seriesEpisodeKey];
    if (!episode) {
        console.error(`[SeriesEpisodeReducer->setNextEpisodeState]: no episode found for key: ${seriesEpisodeKey}`);
        return;
    }

    episode.hasNextEpisode = hasNextEpisode;
}

function setPreviousEpisodeState(state: StateModel['seriesEpisodes'],
                                 { seriesEpisodeKey, hasPreviousEpisode }: { seriesEpisodeKey: SeriesEpisode['key']; hasPreviousEpisode: boolean }) {
    const episode = state[seriesEpisodeKey];
    if (!episode) {
        console.error(`[SeriesEpisodeReducer->setPreviousEpisodeState]: no episode found for key: ${seriesEpisodeKey}`);
        return;
    }

    episode.hasPreviousEpisode = hasPreviousEpisode;
}

function addLinks(state: Record<string, SeriesEpisode>, links: LinkModel[]): Record<string, SeriesEpisode> {
    if (!links.some(link => link.type === LINK_TYPE.PROVIDER_LINK || link.type === LINK_TYPE.PORTAL_EPISODE_LINK)) {
        return state;
    }

    return links.reduce((newState, link) => addLink(newState, link), state);
}

function addLink(state: Record<string, SeriesEpisode>, link: LinkModel): Record<string, SeriesEpisode> {
    if (link.type === LINK_TYPE.PORTAL_EPISODE_LINK) {
        const episode = state[link.parentKey];
        return {
            ...state,
            [episode.key]: {
                ...episode,
                portalLinks: addToArrayIfNotExists(episode.portalLinks, link.key),
            },
        };
    } else if (link.type === LINK_TYPE.PROVIDER_LINK) {
        const episode = state[link.parentKey];
        return {
            ...state,
            [episode.key]: {
                ...episode,
                providorLinks: addToArrayIfNotExists(episode.providorLinks, link.key),
            },
        };
    }

    return state;
}

const seriesEpisodesReducer = createSlice({
    name: 'seriesEpisodes',
    initialState,
    reducers: {
        updateOrAddSeriesEpisodeAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<SeriesEpisode>) => updateOrAddSeriesEpisode(state, action.payload),
        updateOrAddMultipleSeriesEpisodeAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<SeriesEpisode[]>) => updateOrAddMultipleSeriesEpisode(state, action.payload),
        setSeriesEpisodeFinishedStateAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<{ seriesEpisodeKey: SeriesEpisode['key']; isFinished: boolean }>) => setSeriesEpisodeFinished(state, action.payload),
        seriesEpisodeStartedAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<{ seriesEpisodeKey: SeriesEpisode['key']; duration: SeriesEpisode['duration'] }>) => setSeriesEpisodeStarted(state, action.payload),
        setSeriesEpisodeTimeStampAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<{ seriesEpisodeKey: SeriesEpisode['key']; timestamp: number }>) => setTimestamp(state, action.payload),
        setSeriesEpisodeNextEpisodeStateAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<{ seriesEpisodeKey: SeriesEpisode['key']; hasNextEpisode: boolean }>) => setNextEpisodeState(state, action.payload),
        setSeriesEpisodePreviousEpisodeStateAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<{ seriesEpisodeKey: SeriesEpisode['key']; hasPreviousEpisode: boolean }>) => setPreviousEpisodeState(state, action.payload),
    },
    extraReducers: (builder) => {
        builder.addCase(deleteSeriesAction, (state: StateModel['seriesEpisodes'], action: PayloadAction<Series['key']>) => deleteAllEpisodesFromSeries(state, action.payload));
        builder.addCase(updateOrAddMultipleLinksAction, (state: StateModel['seriesEpisodes'], action: PayloadAction<LinkModel[]>) => addLinks(state, action.payload));
        builder.addCase(updateOrAddLinkAction, (state: StateModel['seriesEpisodes'], action: PayloadAction<LinkModel>) => addLink(state, action.payload));
    },
});

export const {
    updateOrAddSeriesEpisodeAction,
    updateOrAddMultipleSeriesEpisodeAction,
    setSeriesEpisodeFinishedStateAction,
    seriesEpisodeStartedAction,
    setSeriesEpisodeTimeStampAction,
    setSeriesEpisodePreviousEpisodeStateAction,
    setSeriesEpisodeNextEpisodeStateAction,
} = seriesEpisodesReducer.actions;

export default seriesEpisodesReducer;
