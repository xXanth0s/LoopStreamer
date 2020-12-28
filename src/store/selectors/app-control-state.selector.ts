import { StateModel } from '../models/state.model';
import { SeriesSeason } from '../models/series-season.model';
import { NamedCollection } from '../models/collection.model';
import { SeriesMetaInfo } from '../models/series-meta-info.model';
import { CollectionType } from '../enums/collection-key.enum';

export const getSelectedSeasonKey = (state: StateModel): SeriesSeason['key'] => state.appControlState.selectedSeason;

export const getMutePreviewVideoState = (state: StateModel): boolean => state.appControlState.mutePreviewVideo;

export const isVideoPictureInPicture = (state: StateModel): boolean => Boolean(state.controlState.isVideoPictureInPicture);

export const getCollectionsForTypes = (state: StateModel, types: CollectionType[]): NamedCollection<SeriesMetaInfo>[] => {
    const collections = Object.values(state.appControlState.seriesCollections);
    return types.flatMap(type => collections.filter(collection => collection.type === type));
};
