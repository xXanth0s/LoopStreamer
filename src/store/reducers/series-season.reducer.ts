import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateModel } from '../models/state.model';
import { SeriesSeason } from '../models/series-season.model';
import { Series } from '../models/series.model';
import { filterObject } from '../utils/selector.utils';
import { deleteSeriesAction } from '../actions/shared.actions';
import { updateOrAddLinkAction, updateOrAddMultipleLinksAction } from './link.reducer';
import { LinkModel } from '../models/link.model';
import { LINK_TYPE } from '../enums/link-type.enum';
import { Logger } from '../../shared/services/logger';
import { addToArrayIfNotExists } from '../../utils/array.utils';
import { SeriesEpisode } from '../models/series-episode.model';
import { updateOrAddMultipleSeriesEpisodeAction, updateOrAddSeriesEpisodeAction } from './series-episode.reducer';

const initialState: StateModel['seriesSeasons'] = {};

function updateOrAddSeriesSeason(state: StateModel['seriesSeasons'], seriesSeason: SeriesSeason): void {
    const oldSeasonObject = state[seriesSeason.key];

    if (oldSeasonObject) {
        state[seriesSeason.key] = {
            ...oldSeasonObject,
            ...seriesSeason,
            portalLinks: [
                ...oldSeasonObject.portalLinks,
                ...seriesSeason.portalLinks,
            ],
            episodes: [
                ...oldSeasonObject.episodes,
                ...seriesSeason.episodes,
            ],
        };
    } else {
        state[seriesSeason.key] = seriesSeason;
    }
}

function updateOrAddMultipleSeriesSeason(state: StateModel['seriesSeasons'], seriesSeasons: SeriesSeason[]): void {
    seriesSeasons.forEach(season => updateOrAddSeriesSeason(state, season));
}

function deleteAllSeasonsForSeries(state: StateModel['seriesSeasons'], seriesKey: string): StateModel['seriesSeasons'] {
    return filterObject(state, season => season.seriesKey !== seriesKey);
}

function addLinks(state: Record<string, SeriesSeason>, links: LinkModel[]) {
    if (links.some(link => link.type === LINK_TYPE.PORTAL_SEASON_LINK)) {
        links.forEach(link => addLink(state, link));
    }
}

function addLink(state: Record<string, SeriesSeason>, link: LinkModel) {
    if (link.type !== LINK_TYPE.PORTAL_SEASON_LINK) {
        return;
    }

    const season = state[link.parentKey];
    if (!season) {
        Logger.error(`[SeriesSeasonReducerducer->addLink] try to add link to season ${link.parentKey}, but no season found`);
        return;
    }

    season.portalLinks = addToArrayIfNotExists(season.portalLinks, link.key);
}

function addMultipleEpisodes(state: StateModel['seriesSeasons'], episodes: SeriesEpisode[]): void {
    episodes.forEach(episode => addEpisode(state, episode));
}

function addEpisode(state: StateModel['seriesSeasons'], episode: SeriesEpisode): void {
    const season = state[episode.seasonKey];
    if (!season) {
        Logger.error(`[SeriesSeasonReducerducer->addEpisodes] try to add episode to season ${episode.seasonKey}, but no season found. Episode:`, episode);
        return;
    }

    season.episodes = addToArrayIfNotExists(season.episodes, episode.key);
}

/* eslint-disable max-len */
const seriesSeasonsReducer = createSlice({
    name: 'seriesSeasons',
    initialState,
    reducers: {
        updateOrAddSeriesSeasonAction: (state: StateModel['seriesSeasons'], action: PayloadAction<SeriesSeason>) => updateOrAddSeriesSeason(state, action.payload),
        updateOrAddMutlipleSeriesSeasonAction: (state: StateModel['seriesSeasons'], action: PayloadAction<SeriesSeason[]>) => updateOrAddMultipleSeriesSeason(state, action.payload),
    },
    extraReducers: (builder) => {
        builder.addCase(deleteSeriesAction, (state: StateModel['seriesSeasons'], action: PayloadAction<Series['key']>) => deleteAllSeasonsForSeries(state, action.payload));
        builder.addCase(updateOrAddMultipleLinksAction, (state: StateModel['seriesSeasons'], action: PayloadAction<LinkModel[]>) => addLinks(state, action.payload));
        builder.addCase(updateOrAddLinkAction, (state: StateModel['seriesSeasons'], action: PayloadAction<LinkModel>) => addLink(state, action.payload));
        builder.addCase(updateOrAddMultipleSeriesEpisodeAction, (state: StateModel['seriesSeasons'], action: PayloadAction<SeriesEpisode[]>) => addMultipleEpisodes(state, action.payload));
        builder.addCase(updateOrAddSeriesEpisodeAction, (state: StateModel['seriesSeasons'], action: PayloadAction<SeriesEpisode>) => addEpisode(state, action.payload));
    },
});
/* eslint-enable max-len */

export const {
    updateOrAddSeriesSeasonAction,
    updateOrAddMutlipleSeriesSeasonAction,
} = seriesSeasonsReducer.actions;

export default seriesSeasonsReducer;
