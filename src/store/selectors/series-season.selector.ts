import { StateModel } from '../models/state.model';
import SeriesEpisode from '../models/series-episode.model';
import { SeriesSeason } from '../models/series-season.model';
import { getSeriesEpisodeByKey, getSeriesEpisodesForSeason } from './series-episode.selector';
import { getKeyForSeriesSeason } from '../utils/key.utils';
import { LANGUAGE } from '../enums/language.enum';
import { getLinksForSeriesSeasonAndPortal } from './línk.selector';
import { getSeriesByKey, getSeriesForSeason } from './series.selector';
import { Logger } from '../../shared/services/logger';

export const getMultipleSeriesSeasonByKeys = (state: StateModel, keys: SeriesSeason['key'][]): SeriesSeason[] => keys.map(key => getSeriesSeasonByKey(state, key));

export const getSeriesSeasonByKey = (state: StateModel, key: SeriesSeason['key']): SeriesSeason => state.seriesSeasons[key];

export const getSeasonsForSeries = (state: StateModel, seriesKey: SeriesSeason['seriesKey']): SeriesSeason[] => {
    const series = getSeriesByKey(state, seriesKey);
    if (!series) {
        Logger.error(`[getSeasonsForSeries] no series found for key ${seriesKey}`);
        return [];
    }

    return getMultipleSeriesSeasonByKeys(state, series.seasons);
};

export const getSeriesSeasonForEpisode = (state: StateModel, seriesEpisodeKey: SeriesEpisode['key']): SeriesSeason => {
    const episode = getSeriesEpisodeByKey(state, seriesEpisodeKey);
    const seasonKey = getKeyForSeriesSeason(episode.seriesKey, `${episode.season}`);

    return getSeriesSeasonByKey(state, seasonKey);
};

export const getNextSeason = (state: StateModel, seasonKey: SeriesSeason['key']): SeriesSeason => getSeasonWithOffset(state, seasonKey, 1);

export const getSeasonWithOffset = (state: StateModel, seasonKey: SeriesSeason['key'], offset: number): SeriesSeason => {
    const currentSeason = getSeriesSeasonByKey(state, seasonKey);

    if (!currentSeason) {
        return null;
    }

    return getSeasonsForSeries(state, currentSeason.seriesKey)
        .find(season => season.seasonNumber === currentSeason.seasonNumber + offset);
};

export const hasSeasonAlreadyPlayedEpisodes = (state: StateModel, seasonKey: SeriesSeason['key']): boolean => {
    const episodes = getSeriesEpisodesForSeason(state, seasonKey);
    return episodes.some(episode => Boolean(episode.timestamp));
};

export function getAvailableLanguagesForSeasonAndActivePortal(state: StateModel, seasonKey: SeriesSeason['key']): LANGUAGE[] {
    let portal = state.appControlState.activePortal;
    if (!portal) {
        const series = getSeriesForSeason(state, seasonKey);
        portal = series.lastUsedPortal;
    }
    const links = getLinksForSeriesSeasonAndPortal(state, seasonKey, portal);

    const languages = links
        .map(link => link.language)
        .filter(language => language !== LANGUAGE.NONE);

    return [ ...new Set(languages) ];
}
