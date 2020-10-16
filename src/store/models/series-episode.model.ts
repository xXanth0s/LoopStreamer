import { PORTALS } from '../enums/portals.enum';
import { PROVIDORS } from '../enums/providors.enum';

export default interface  SeriesEpisode {
    key: string;
    seriesKey: string;
    seasonKey: string;
    season: number;
    episodeNumber: number;
    duration?: number;
    portalLinks: Partial<{
        [key in PORTALS]: {
            [key in PROVIDORS]: string
        }
    }>;
    providorLinks: Partial<{ [key in PROVIDORS]?: string }>
    timestamp?: number;
    isFinished?: boolean;
}
