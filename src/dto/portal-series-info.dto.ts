import { PORTALS } from '../store/enums/portals.enum';
import { LanguageLinkMap } from '../types/language-link-map.type';


export interface PortalSeriesInfoDto {
    title: string;
    link: string;
    portal: PORTALS
    posterHref?: string;
    seasonsLinks?: { [season: string]: LanguageLinkMap };
}
