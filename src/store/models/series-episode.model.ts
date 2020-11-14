import Series from './series.model';
import { LinkModel } from './link.model';

export default interface SeriesEpisode {
    key: string;
    seriesKey: string;
    seasonKey: Series['key'];
    season: string;
    episodeNumber: string;
    duration?: number;
    hasNextEpisode?: boolean;
    hasPreviousEpisode?: boolean;
    portalLinks: LinkModel['key'][];
    providorLinks: LinkModel['key'][];
    timestamp?: number;
    isFinished?: boolean;
}
