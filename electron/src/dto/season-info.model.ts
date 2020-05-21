import { SeriesMetaInfoDto } from './series-meta-info.dto';
import { SeriesSeason } from '../store/models/series-season.model';

export interface SeasonInfo {
    seriesInfo: SeriesMetaInfoDto;
    seasons: SeriesSeason;

}
