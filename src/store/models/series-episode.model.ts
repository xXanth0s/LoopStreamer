import { PORTALS } from '../enums/portals.enum';
import { PROVIDORS } from '../enums/providors.enum';

export default interface  SeriesEpisode {
    key: string;
    seriesKey: string;
    season: number;
    episode: number;
    hasNextEpisode?: boolean;
    hasPreviousEpisode?: boolean;
    portalLinks: { [key in PORTALS]: {
        [key in PROVIDORS]: string
    } };
    providorLinks: { [key in PROVIDORS]?: string }
    providorHref?: string;
    timestamp?: number;
}
