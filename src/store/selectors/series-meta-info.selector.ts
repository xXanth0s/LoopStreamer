import { StateModel } from '../models/state.model';
import { SeriesMetaInfo } from '../models/series-meta-info.model';

export const getMultipleSeriesMetaInfos = (state: StateModel,
                                           keys: SeriesMetaInfo['key'][]):
    SeriesMetaInfo[] => keys.map(key => getSeriesMetaInfo(state, key));

export const getSeriesMetaInfo = (state: StateModel, key: SeriesMetaInfo['key']): SeriesMetaInfo => {
    const metaInfo = state.seriesMetaInfos[key];
    if (!metaInfo) {
        return state.series[key];
    }

    return metaInfo;
};
