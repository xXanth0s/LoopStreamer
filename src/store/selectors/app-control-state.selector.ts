import { StateModel } from '../models/state.model';
import Series from '../models/series.model';
import { PORTALS } from '../enums/portals.enum';
import SeriesEpisode from '../models/series-episode.model';
import { getSeriesByKey, getSeriesForEpisode, getSeriesForSeason } from './series.selector';
import { LANGUAGE } from '../enums/language.enum';
import { SeriesSeason } from '../models/series-season.model';
import { NamedCollection } from '../models/collection.model';

export const getExpandedSeries = (state: StateModel): Series['key'] => state.appControlState.selectedSeriesKey;

export const isSeriesExpandedOnApp = (state: StateModel, seriesKey: Series['key']): boolean => {
    return state.appControlState.selectedSeriesKey === seriesKey;
};

export const isAnySeriesExpandedOnApp = (state: StateModel, seriesKeys: Series['key'][]): boolean => {
    return seriesKeys.some(key => key === state.appControlState.selectedSeriesKey);
};

export const getSelectedSeason = (state: StateModel): SeriesSeason['key'] => state.appControlState.selectedSeason;

export const getActivePortalOnAppOrSeries = (state: StateModel, seriesEpisodeKey: SeriesEpisode['key']): PORTALS => {
    return state.appControlState.activePortal || getSeriesForEpisode(state, seriesEpisodeKey).lastUsedPortal;
};

export const getSelectedLanguageOrLastUsedSeriesLanguageForSeason = (state: StateModel, seriesSeasonKey: SeriesSeason['key']): LANGUAGE => {
    const series = getSeriesForSeason(state, seriesSeasonKey);
    return getSelectedLanguageOrLastUsedSeriesLanguage(state, series.key);
};

export const getSelectedLanguageOrLastUsedSeriesLanguageForEpisode = (state: StateModel, seriesEpisodeKey: SeriesEpisode['key']): LANGUAGE => {
    const series = getSeriesForEpisode(state, seriesEpisodeKey);
    return getSelectedLanguageOrLastUsedSeriesLanguage(state, series.key);
};

export const getSelectedLanguageOrLastUsedSeriesLanguage = (state: StateModel, seriesKey: Series['key']): LANGUAGE => {
    const { selectedLanguage } = state.appControlState;
    if (selectedLanguage && selectedLanguage !== LANGUAGE.NONE) {
        return state.appControlState.selectedLanguage;
    }

    const series = getSeriesByKey(state, seriesKey);
    return series.lastUsedLanguage || LANGUAGE.NONE;
};

export const isVideoPictureInPicture = (state: StateModel): boolean => Boolean(state.controlState.isVideoPictureInPicture);


export const getSeriesCollections = (state: StateModel): NamedCollection<Series>[] => {
    return Object.values(state.appControlState.seriesCollections);
};
