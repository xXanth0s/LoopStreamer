import { PORTALS } from '../enums/portals.enum';
import { PROVIDORS } from '../enums/providors.enum';
import Series from './series.model';

export default interface SeriesEpisode {
    key: string;
    seriesKey: string;
    seasonKey: Series['key'];
    season: number;
    episodeNumber: number;
    duration?: number;
    hasNextEpisode?: boolean;
    hasPreviousEpisode?: boolean;
    portalLinks: Partial<{
        [key in PORTALS]: {
            [key in PROVIDORS]: string
        }
    }>;
    providorLinks: Partial<{ [key in PROVIDORS]?: string }>
    timestamp?: number;
    isFinished?: boolean;
}
