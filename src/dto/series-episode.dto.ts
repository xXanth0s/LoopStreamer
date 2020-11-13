import { PROVIDORS } from '../store/enums/providors.enum';
import { PORTALS } from '../store/enums/portals.enum';
import { LanguageLinkCollection } from '../store/models/language-link.model';
import { Language } from '../store/enums/language.enum';

export interface SeriesEpisodeDto {
    episodeNumber: number;
    seasonNumber: number;
    portalLinks: {
        [key in Language]?: {
            [key in PROVIDORS]?: string
        }
    };
    providorLinks: { [key in PROVIDORS]?: LanguageLinkCollection }
    portal: PORTALS;
    seriesTitle: string;
}
