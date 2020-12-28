import Series from './series.model';
import { SeriesSeason } from './series-season.model';
import { PORTALS } from '../enums/portals.enum';
import { LANGUAGE } from '../enums/language.enum';
import { NamedCollection } from './collection.model';
import { SeriesMetaInfo } from './series-meta-info.model';

export default interface AppControlStateModel {
    selectedSeriesKey?: Series['key'];
    selectedSeason?: SeriesSeason['key'];
    mutePreviewVideo: boolean;
    searchText: string;
    seriesCollections: Record<string, NamedCollection<SeriesMetaInfo>>;
}
