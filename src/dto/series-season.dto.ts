import { PORTALS } from '../store/enums/portals.enum';

export interface SeriesSeasonDto {
    seriesTitle: string;
    seasonNumber: number;
    portal: PORTALS;
    link: string

}
