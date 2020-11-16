import Series from './series.model';
import { LinkModel } from './link.model';
import SeriesEpisode from './series-episode.model';

export interface SeriesSeason {
    key: string;
    seriesKey: Series['key'];
    seasonNumber: string;
    portalLinks: LinkModel['key'][];
    episodes: SeriesEpisode['key'][];
}
