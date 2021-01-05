import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Series } from '../models/series.model';
import { StateModel } from '../models/state.model';
import { SeriesEpisode } from '../models/series-episode.model';
import { PORTALS } from '../enums/portals.enum';
import { Logger } from '../../shared/services/logger';
import { deleteSeriesAction } from '../actions/shared.actions';
import { filterObject } from '../utils/selector.utils';
import { updateOrAddLinkAction, updateOrAddMultipleLinksAction } from './link.reducer';
import { LinkModel } from '../models/link.model';
import { LINK_TYPE } from '../enums/link-type.enum';
import { addToArrayIfNotExists } from '../../utils/array.utils';
import { LANGUAGE } from '../enums/language.enum';
import { updateOrAddMutlipleSeriesSeasonAction, updateOrAddSeriesSeasonAction } from './series-season.reducer';
import { SeriesSeason } from '../models/series-season.model';

const initialState: StateModel['series'] = {};

const removeSeries = (state: { [key: string]: Series }, key: Series['key']): { [key: string]: Series } => {
    delete state[key];
    return state;
};

const resetSeriesStartTime = (state: { [key: string]: Series }, { seriesKey }: { seriesKey: Series['key'] }): void => {
    const series = state[seriesKey];
    state[seriesKey] = {
        ...series,
        isStartTimeConfigured: false,
        scipStartTime: 0,
    };
};

const resetSeriesEndTime = (state: { [key: string]: Series }, { seriesKey }: { seriesKey: Series['key'] }): void => {
    const series = state[seriesKey];
    state[seriesKey] = {
        ...series,
        isEndTimeConfigured: false,
        scipEndTime: 0,
    };
};

const setStartTimeForSeries = (state: { [key: string]: Series },
                               key: Series['key'],
                               scipStartTime?: Series['scipStartTime']): { [key: string]: Series } => {
    const series = state[key];
    state[key] = {
        ...series,
        isStartTimeConfigured: true,
        scipStartTime: Math.trunc(scipStartTime),
    };
    return state;
};

const setEndTimeForSeries = (state: { [key: string]: Series },
                             key: Series['key'],
                             scipEndTime?: Series['scipStartTime']): { [key: string]: Series } => {
    const series = state[key];
    state[key] = {
        ...series,
        isEndTimeConfigured: true,
        scipEndTime: Math.trunc(scipEndTime),
    };
};

function updateOrAddSeries(state: { [key: string]: Series }, seriesInfo: Series): void {
    const { key } = seriesInfo;

    const oldSeries = state[key];

    if (oldSeries) {
        state[key] = {
            ...oldSeries,
            ...seriesInfo,
            titles: {
                ...oldSeries.titles,
                ...seriesInfo.titles,
            },
            previewVideos: {
                ...oldSeries.previewVideos,
                ...seriesInfo.previewVideos,
            },
            apiKeys: {
                ...oldSeries.apiKeys,
                ...seriesInfo.apiKeys,
            },
            descriptions: {
                ...oldSeries.descriptions,
                ...seriesInfo.descriptions,
            },
            portalLinks: [
                ...oldSeries.portalLinks,
                ...seriesInfo.portalLinks,
            ],
            seasons: [
                ...oldSeries.seasons,
                ...seriesInfo.seasons,

            ],
        };
    } else {
        state[key] = seriesInfo;
    }
}

function updateOrAddMultipleSeries(state: { [key: string]: Series }, seriesInfos: Series[]): void {
    seriesInfos.forEach(series => updateOrAddSeries(state, series));
}

function setLastWatchedEpisode(state: StateModel['series'],
                               actionData: { seriesKey: Series['key']; seriesEpisodeKey: SeriesEpisode['key'] }): void {
    const { seriesEpisodeKey, seriesKey } = actionData;
    if (!state[seriesKey]) {
        console.error(`[SeriesReducer->seriesStarted] tried to update series ${seriesKey} but no series found`);
        return;
    }

    state[seriesKey].lastEpisodeWatched = seriesEpisodeKey;
}

function setLastUsedPortalForSeries(state: StateModel['series'],
                                    { seriesKey, portal }: { seriesKey: Series['key']; portal: PORTALS }): void {
    if (!state[seriesKey]) {
        Logger.error(`[SeriesReducer->setLastUsedPortalForSeries] tried to update series ${seriesKey} but no series found`);
        return;
    }

    state[seriesKey].lastUsedPortal = portal;
}

function deleteSeries(state: StateModel['series'], seriesKey: string): StateModel['series'] {
    return filterObject(state, series => series.key !== seriesKey);
}

function addMultipleLinks(state: StateModel['series'], links: LinkModel[]) {
    if (links.some(link => link.type === LINK_TYPE.PORTAL_SERIES_LINK)) {
        links.forEach(link => addLink(state, link));
    }
}

function addLink(state: StateModel['series'], link: LinkModel): void {
    if (link.type !== LINK_TYPE.PORTAL_SERIES_LINK) {
        return;
    }

    const series = state[link.parentKey];
    if (!series) {
        Logger.error(`[SeriesReducerducer->addLink] try to add link to series ${link.parentKey}, but no series found`);
        return;
    }

    series.portalLinks = addToArrayIfNotExists(series.portalLinks, link.key);
}

function setLastUsedLanguageForSeries(state: { [key: string]: Series },
                                      { seriesKey, language }: { seriesKey: Series['key']; language: LANGUAGE }) {
    const series = state[seriesKey];
    if (!series) {
        Logger.error(`[SeriesReducerducer->setLastUsedLanguageForSeries] try to add link to series ${seriesKey}, but no series found`);
        return;
    }

    series.lastUsedLanguage = language;
}

function addMultipleSeasons(state: Record<string, Series>, seasons: SeriesSeason[]) {
    seasons.forEach(season => addSeasons(state, season));
}

function addSeasons(state: Record<string, Series>, season: SeriesSeason) {
    const series = state[season.seriesKey];
    if (!series) {
        Logger.error(`[SeriesReducerducer->addSeasons] try to add link to season ${season.key}, but no series found for key ${season.seriesKey}`);
        return;
    }

    series.seasons = addToArrayIfNotExists(series.seasons, season.key);
}

function setTimesForSeries(state: StateModel['series'],
                           data: {
                                    key: Series['key'];
                                    scipStartTime?: Series['scipStartTime'];
                                    scipEndTime?: Series['scipStartTime'];
                            }) {
    const { key, scipStartTime, scipEndTime } = data;
    setStartTimeForSeries(state, key, scipStartTime);
    setEndTimeForSeries(state, key, scipEndTime);
}

/* eslint-disable max-len */
const seriesSlice = createSlice({
    name: 'series',
    initialState,
    reducers: {
        removeSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<Series['key']>) => removeSeries(state, action.payload),
        setStartTimeForSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<{ key: Series['key']; scipStartTime?: Series['scipStartTime'] }>) => setStartTimeForSeries(state, action.payload.key, action.payload.scipStartTime),
        setEndTimeForSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<{ key: Series['key']; scipEndTime?: Series['scipStartTime'] }>) => setEndTimeForSeries(state, action.payload.key, action.payload.scipEndTime),
        setTimesForSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<{ key: Series['key']; scipStartTime?: Series['scipStartTime']; scipEndTime?: Series['scipStartTime'] }>) => setTimesForSeries(state, action.payload),
        resetSeriesStartTimeAction: (state: { [key: string]: Series }, action: PayloadAction<{ seriesKey: Series['key'] }>) => resetSeriesStartTime(state, action.payload),
        resetSeriesEndTimeAction: (state: { [key: string]: Series }, action: PayloadAction<{ seriesKey: Series['key'] }>) => resetSeriesEndTime(state, action.payload),
        updateOrAddSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<Series>) => updateOrAddSeries(state, action.payload),
        updateOrAddMultipleSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<Series[]>) => updateOrAddMultipleSeries(state, action.payload),
        setLastUsedPortalForSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<{ seriesKey: Series['key']; portal: PORTALS }>) => setLastUsedPortalForSeries(state, action.payload),
        setLastUsedLanguageForSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<{ seriesKey: Series['key']; language: LANGUAGE }>) => setLastUsedLanguageForSeries(state, action.payload),
        setLastWatchedEpisodeAction: (state: { [key: string]: Series }, action: PayloadAction<{ seriesKey: Series['key']; seriesEpisodeKey: SeriesEpisode['key'] }>) => setLastWatchedEpisode(state, action.payload),
    },
    extraReducers: (builder) => {
        builder.addCase(deleteSeriesAction, (state: StateModel['series'], action: PayloadAction<Series['key']>) => deleteSeries(state, action.payload));
        builder.addCase(updateOrAddMultipleLinksAction, (state: StateModel['series'], action: PayloadAction<LinkModel[]>) => addMultipleLinks(state, action.payload));
        builder.addCase(updateOrAddLinkAction, (state: StateModel['series'], action: PayloadAction<LinkModel>) => addLink(state, action.payload));
        builder.addCase(updateOrAddMutlipleSeriesSeasonAction, (state: StateModel['series'], action: PayloadAction<SeriesSeason[]>) => addMultipleSeasons(state, action.payload));
        builder.addCase(updateOrAddSeriesSeasonAction, (state: StateModel['series'], action: PayloadAction<SeriesSeason>) => addSeasons(state, action.payload));
    },
});
/* eslint-enable max-len */

export const {
    removeSeriesAction,
    resetSeriesStartTimeAction,
    resetSeriesEndTimeAction,
    setStartTimeForSeriesAction,
    setEndTimeForSeriesAction,
    setTimesForSeriesAction,
    updateOrAddSeriesAction,
    updateOrAddMultipleSeriesAction,
    setLastUsedPortalForSeriesAction,
    setLastWatchedEpisodeAction,
    setLastUsedLanguageForSeriesAction,
} = seriesSlice.actions;

export default seriesSlice;
