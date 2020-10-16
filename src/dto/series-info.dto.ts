import { PORTALS } from '../store/enums/portals.enum';

export interface SeriesInfoDto {
    title: string;
    link: string;
    portal: PORTALS
    posterHref?: string;
    description?: string;
    seasonsLinks?: { [key: number]: string };

}
