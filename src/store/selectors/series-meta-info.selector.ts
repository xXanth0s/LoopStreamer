import { StateModel } from '../models/state.model';
import { SeriesMetaInfo } from '../models/series-meta-info.model';

export const getMultipleSeriesMetaInfos = (state: StateModel, keys: SeriesMetaInfo['key'][]): SeriesMetaInfo[] => {
    return keys.map(key => state.seriesMetaInfos[key]);
};

export const getSeriesMetaInfo = (state: StateModel, key: SeriesMetaInfo['key']): SeriesMetaInfo => {
    return state.seriesMetaInfos[key];
};
