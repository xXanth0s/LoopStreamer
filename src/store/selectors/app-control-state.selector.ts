import { StateModel } from '../models/state.model';
import Series from '../models/series.model';
import { PORTALS } from '../enums/portals.enum';
import SeriesEpisode from '../models/series-episode.model';
import { getSeriesByKey, getSeriesForEpisode, getSeriesForSeason } from './series.selector';
import { LANGUAGE } from '../enums/language.enum';
import { SeriesSeason } from '../models/series-season.model';
import { NamedCollection } from '../models/collection.model';
import { SeriesMetaInfo } from '../models/series-meta-info.model';
import { CollectionType } from '../enums/collection-key.enum';

export const getExpandedSeries = (state: StateModel): Series['key'] => state.appControlState.selectedSeriesKey;

export const isSeriesExpandedOnApp = (state: StateModel, seriesKey: Series['key']): boolean => state.appControlState.selectedSeriesKey === seriesKey;

export const isAnySeriesExpandedOnApp = (state: StateModel, seriesKeys: Series['key'][]): boolean => seriesKeys.some(key => key === state.appControlState.selectedSeriesKey);

export const getSelectedSeasonKey = (state: StateModel): SeriesSeason['key'] => state.appControlState.selectedSeason;

export const getActivePortalOnAppOrSeries = (state: StateModel, seriesEpisodeKey: SeriesEpisode['key']): PORTALS => state.appControlState.activePortal || getSeriesForEpisode(state, seriesEpisodeKey).lastUsedPortal;

export const getMutePreviewVideoState = (state: StateModel): boolean => state.appControlState.mutePreviewVideo;

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

export const getCollectionsForTypes = (state: StateModel, types: CollectionType[]): NamedCollection<SeriesMetaInfo>[] => {
    const collections = Object.values(state.appControlState.seriesCollections);
    return types.flatMap(type => collections.filter(collection => collection.type === type));
};
