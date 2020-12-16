import { StateModel } from '../models/state.model';
import SeriesEpisode from '../models/series-episode.model';
import { SeriesSeason } from '../models/series-season.model';
import { sortArrayForKey } from '../../utils/array.utils';
import { getSelectedLanguageOrLastUsedSeriesLanguageForEpisode } from './app-control-state.selector';
import { getActiveOrLastUsedPortalForSeries } from './series.selector';
import { getPortalLinksForSeriesEpisodePortalAndLanguage } from './línk.selector';
import { getSeasonWithOffset, getSeriesSeasonByKey } from './series-season.selector';
import { Logger } from '../../shared/services/logger';

export const getMultipleSeriesEpisodeByKeys = (state: StateModel, keys: SeriesEpisode['key'][]): SeriesEpisode[] => keys.map(key => getSeriesEpisodeByKey(state, key));

export const getSeriesEpisodeByKey = (state: StateModel, key: SeriesEpisode['key']): SeriesEpisode => state.seriesEpisodes[key];

export const getSeriesEpisodesForSeason = (state: StateModel, seasonKey: SeriesEpisode['seasonKey']): SeriesEpisode[] => {
    const season = getSeriesSeasonByKey(state, seasonKey);
    if (!season) {
        Logger.error(`[getSeriesEpisodesForSeason] no season found for key ${seasonKey}`);
        return [];
    }

    return getMultipleSeriesEpisodeByKeys(state, season.episodes);
};

export const getFirstEpisodeForSeason = (state: StateModel, key: SeriesSeason['key']): SeriesEpisode => {
    const seasonEpisodes = getSeriesEpisodesForSeason(state, key);
    if (!seasonEpisodes.length) {
        return null;
    }

    return sortArrayForKey(seasonEpisodes, (episode: SeriesEpisode) => episode.episodeNumber)[0];
};

export const getLastEpisodeForSeason = (state: StateModel, key: SeriesSeason['key']): SeriesEpisode => {
    const seasonEpisodes = getSeriesEpisodesForSeason(state, key);
    if (!seasonEpisodes.length) {
        return null;
    }

    const sortedArray = sortArrayForKey(seasonEpisodes, (episode: SeriesEpisode) => episode.episodeNumber);
    return sortedArray[sortedArray.length - 1];
};

export const getNextEpisode = (state: StateModel, episodeKey: SeriesEpisode['key']): SeriesEpisode => {
    const episode = getSeriesEpisodeByKey(state, episodeKey);
    if (!episode) {
        console.error('[Series Episode Selector => getNextEpisode] no episode found for key', episodeKey);
    }

    let nextEpisode = getEpisodeWithOffset(state, episodeKey, 1);
    if (nextEpisode) {
        return nextEpisode;
    }

    const nextSeason = getSeasonWithOffset(state, episode.seasonKey, 1);
    if (!nextSeason) {
        return null;
    }

    return getFirstEpisodeForSeason(state, nextSeason.key);
};

export const getPreviousEpisode = (state: StateModel, episodeKey: SeriesEpisode['key']): SeriesEpisode => {
    const episode = getSeriesEpisodeByKey(state, episodeKey);
    if (!episode) {
        console.error('[Series Episode Selector => getNextEpisode] no episode found for key', episodeKey);
    }

    let previousEpisode = getEpisodeWithOffset(state, episodeKey, -1);
    if (previousEpisode) {
        return previousEpisode;
    }

    const previousSeason = getSeasonWithOffset(state, episode.seasonKey, -1);
    if (!previousSeason) {
        return null;
    }

    return getLastEpisodeForSeason(state, previousSeason.key);
};

export const getEpisodeWithOffset = (state: StateModel, episodeKey: SeriesEpisode['key'], offset: number): SeriesEpisode => {
    const episode = getSeriesEpisodeByKey(state, episodeKey);

    if (!episode) {
        console.error('[Series Episode Selector => hasSeriesEpisodeNextEpisode] season or episode not found');
        return null;
    }

    const seasonEpisodes = getSeriesEpisodesForSeason(state, episode.seasonKey);

    return seasonEpisodes.find(seasonEpisode => seasonEpisode.episodeNumber === (episode.episodeNumber + offset));
};

export const hasEpisodeLinksForSelectedLanguageAndPortal = (state: StateModel, episodeKey: SeriesEpisode['key']): boolean => {
    const episode = getSeriesEpisodeByKey(state, episodeKey);
    const portal = getActiveOrLastUsedPortalForSeries(state, episode.seriesKey);
    const language = getSelectedLanguageOrLastUsedSeriesLanguageForEpisode(state, episodeKey);

    return getPortalLinksForSeriesEpisodePortalAndLanguage(state, episode.key, portal, language).length > 0;
};
