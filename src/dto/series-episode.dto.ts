import { PORTALS } from '../store/enums/portals.enum';
import { LANGUAGE } from '../store/enums/language.enum';
import { ProvidorLink } from '../background/models/providor-link.model';

export interface SeriesEpisodeDto {
    episodeNumber: string;
    seasonNumber: string;
    portalLinks: {
        [key in LANGUAGE]?: ProvidorLink[]
    };
    portal: PORTALS;
    seriesTitle: string;
}
