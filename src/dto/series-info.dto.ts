import { PORTALS } from '../store/enums/portals.enum';
import { LanguageLinkMap } from '../types/language-link-map.type';


export interface SeriesInfoDto {
    title: string;
    link: string;
    portal: PORTALS
    posterHref?: string;
    description?: string;
    seasonsLinks?: { [season: string]: LanguageLinkMap };
}
