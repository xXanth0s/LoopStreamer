import { PORTALS } from '../enums/portals.enum';
import { PROVIDORS } from '../enums/providors.enum';

export default interface  SeriesEpisode {
    key: string;
    seriesKey: string;
    season: number;
    episodeNumber: number;
    duration: number;
    portalLinks: { [key in PORTALS]: {
        [key in PROVIDORS]: string
    } };
    providorLinks: { [key in PROVIDORS]?: string }
    timestamp?: number;
    isFinished: boolean;
}
