import { SeriesSeason } from './series-season.model';
import { NamedCollection } from './collection.model';
import { SeriesMetaInfo } from './series-meta-info.model';
import { Series } from './series.model';

export interface AppControlStateModel {
    selectedSeriesKey?: Series['key'];
    selectedSeason?: SeriesSeason['key'];
    mutePreviewVideo: boolean;
    searchText: string;
    seriesCollections: Record<string, NamedCollection<SeriesMetaInfo>>;
}
