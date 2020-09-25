import { PROVIDORS } from '../store/enums/providors.enum';
import { PORTALS } from '../store/enums/portals.enum';

export interface SeriesEpisodeDto {
    epdisodeNumber: number;
    seasonNumber: number;
    portalLinks: {
        [key in PROVIDORS]?: string
    };
    providorLinks: { [key in PROVIDORS]?: string }
    portal: PORTALS;
    seriesTitle: string;
}
