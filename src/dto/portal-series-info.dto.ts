import { PORTALS } from '../store/enums/portals.enum';
import { LanguageLinkMap } from '../types/language-link-map.type';

export interface PortalSeriesInfoDto {
    link: string;
    portal: PORTALS;
    seasonsLinks?: { [season: string]: LanguageLinkMap };
}
