import Series from './series.model';
import SeriesEpisode from './series-episode.model';
import { PORTALS } from '../enums/portals.enum';

export interface SeriesSeason {
    key: string;
    seriesKey: Series['key'];
    seasonNumber: number;
    episodes: SeriesEpisode['key'][];
    portalLinks: {[key in PORTALS]: string }
}
