import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Series from '../models/series.model';
import { StateModel } from '../models/state.model';
import SeriesEpisode from '../models/series-episode.model';
import { PORTALS } from '../enums/portals.enum';
import { Logger } from '../../shared/services/logger';
import { deleteSeriesAction } from '../actions/shared.actions';
import { filterObject } from '../utils/selector.utils';
import { addOrUpdateMultipleLinksAction } from './link.reducer';
import { LinkModel } from '../models/link.model';
import { LINK_TYPE } from '../enums/link-type.enum';
import { addToArrayIfNotExists } from '../../utils/array.utils';

const initialState: StateModel['series'] = {};

const removeSeries = (state: { [key: string]: Series }, key: Series['key']): { [key: string]: Series } => {
    delete state[key];
    return state;
};

const resetSeries = (state: { [key: string]: Series }, key: Series['key']): { [key: string]: Series } => {
    const series = state[key];
    state[key] = {
        ...series,
        isEndTimeConfigured: false,
        isStartTimeConfigured: false,
        scipEndTime: 0,
        scipStartTime: 0
    };
    return state;
};

const setStartTimeForSeries = (state: { [key: string]: Series }, key: Series['key'], scipStartTime?: Series['scipStartTime']): { [key: string]: Series } => {
    const series = state[key];
    state[key] = {
        ...series,
        isStartTimeConfigured: true,
        scipStartTime: Math.trunc(scipStartTime),
    };
    return state;
};

const setEndTimeForSeries = (state: { [key: string]: Series }, key: Series['key'], scipEndTime?: Series['scipStartTime']): { [key: string]: Series } => {
    const series = state[key];
    state[key] = {
        ...series,
        isEndTimeConfigured: true,
        scipEndTime: Math.trunc(scipEndTime),
    };
    return state;
};

function updateOrAddSeries(state: { [key: string]: Series }, seriesInfo: Series): void {
    const {key} = seriesInfo;

    const portalLinks = state[key]?.portalLinks || [];
    state[key] = {
        ...state[key],
        ...seriesInfo,
        portalLinks
    };
}

function updateOrAddMultipleSeries(state: { [key: string]: Series }, seriesInfos: Series[]): void {
    for (const series of seriesInfos) {
        updateOrAddSeries(state, series);
    }
}

function setLastWatchedEpisode(state: StateModel['series'], actionData: { seriesKey: Series['key'], seriesEpisodeKey: SeriesEpisode['key'] }): void {
    const {seriesEpisodeKey, seriesKey} = actionData;
    if (!state[seriesKey]) {
        console.error(`[SeriesReducer->seriesStarted] tried to update series ${seriesKey} but no series found`);
        return;
    }

    state[seriesKey].lastEpisodeWatched = seriesEpisodeKey;
}

function setLastUsedPortalForSeries(state: StateModel['series'], {seriesKey, portal}: { seriesKey: Series['key']; portal: PORTALS }): void {
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
    links.forEach(link => addLink(state, link));
}

function addLink(state: StateModel['series'], link: LinkModel): void {
    if(link.type !== LINK_TYPE.PORTAL_SERIES_LINK ) {
        return
    }

    const series = state[link.parentKey];
    if(!series) {
        Logger.error(`[SeriesReducerducer->addLink] try to add link to series ${link.parentKey}, but no series found`);
        return;
    }

    series.portalLinks = addToArrayIfNotExists(series.portalLinks, link.key);
}

const seriesSlice = createSlice({
    name: 'series',
    initialState,
    reducers: {
        removeSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<Series['key']>) =>
            removeSeries(state, action.payload),
        setStartTimeForSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<{ key: Series['key'], scipStartTime?: Series['scipStartTime'] }>) =>
            setStartTimeForSeries(state, action.payload.key, action.payload.scipStartTime),
        setEndTimeForSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<{ key: Series['key'], scipEndTime?: Series['scipStartTime'] }>) =>
            setEndTimeForSeries(state, action.payload.key, action.payload.scipEndTime),
        resetSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<Series['key']>) =>
            resetSeries(state, action.payload),
        updateOrAddSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<Series>) =>
            updateOrAddSeries(state, action.payload),
        updateOrAddMultipleSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<Series[]>) =>
            updateOrAddMultipleSeries(state, action.payload),
        setLastUsedPortalForSeriesAction: (state: { [key: string]: Series }, action: PayloadAction<{ seriesKey: Series['key'], portal: PORTALS }>) =>
            setLastUsedPortalForSeries(state, action.payload),
        setLastWatchedEpisodeAction: (state: { [key: string]: Series }, action: PayloadAction<{ seriesKey: Series['key'], seriesEpisodeKey: SeriesEpisode['key'] }>) =>
            setLastWatchedEpisode(state, action.payload),
    }, extraReducers: (builder) => {
        builder.addCase(deleteSeriesAction, (state: StateModel['series'], action: PayloadAction<Series['key']>) =>
            deleteSeries(state, action.payload));
        builder.addCase(addOrUpdateMultipleLinksAction, (state: StateModel['series'], action: PayloadAction<LinkModel[]>) =>
            addMultipleLinks(state, action.payload));
    },
});

export const {
    removeSeriesAction,
    resetSeriesAction,
    setStartTimeForSeriesAction,
    setEndTimeForSeriesAction,
    updateOrAddSeriesAction,
    updateOrAddMultipleSeriesAction,
    setLastUsedPortalForSeriesAction,
    setLastWatchedEpisodeAction
} = seriesSlice.actions;

export default seriesSlice;
