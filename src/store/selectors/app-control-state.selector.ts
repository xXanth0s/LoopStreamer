import { StateModel } from '../models/state.model';
import Series from '../models/series.model';
import { PORTALS } from '../enums/portals.enum';
import SeriesEpisode from '../models/series-episode.model';
import { getSeriesForEpisode, getSeriesForSeason } from './series.selector';
import { LANGUAGE } from '../enums/language.enum';
import { SeriesSeason } from '../models/series-season.model';

export const getExpandedSeries = (state: StateModel): Series['key'] => state.appControlState.selectedSeriesKey;

export const isSeriesExpandedOnApp = (state: StateModel, seriesKey: Series['key']): boolean => {
    return state.appControlState.selectedSeriesKey === seriesKey;
};

export const isAnySeriesExpandedOnApp = (state: StateModel, seriesKeys: Series['key'][]): boolean => {
    return seriesKeys.some(key => key === state.appControlState.selectedSeriesKey);
};

export const getActivePortalOnAppOrSeries = (state: StateModel, seriesEpisodeKey: SeriesEpisode['key']): PORTALS => {
    return state.appControlState.activePortal || getSeriesForEpisode(state, seriesEpisodeKey).lastUsedPortal;
};

export const getSelectedLanguageOrLastUsedSeriesLanguage = (state: StateModel, seriesSeasonKey: SeriesSeason['key']): LANGUAGE => {
    if (state.appControlState.selectedLanguage !== LANGUAGE.NONE) {
        return state.appControlState.selectedLanguage;
    }

    const series = getSeriesForSeason(state, seriesSeasonKey);
    return series.lastUsedLanguage || LANGUAGE.NONE;
};

export const isVideoPictureInPicture = (state: StateModel): boolean => Boolean(state.controlState.isVideoPictureInPicture);
