import { PORTALS } from '../store/enums/portals.enum';
import { Language } from '../store/enums/language.enum';

type languageLinkMap = Partial<Record<Language, string>>

export interface SeriesInfoDto {
    title: string;
    link: string;
    portal: PORTALS
    posterHref?: string;
    description?: string;
    seasonsLinks?: { [season: string]: languageLinkMap };
}
