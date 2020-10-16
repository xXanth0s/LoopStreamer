import Series from './series.model';
import { PORTALS } from '../enums/portals.enum';

export interface SeriesSeason {
    key: string;
    seriesKey: Series['key'];
    seasonNumber: number;
    portalLinks: Partial<{ [key in PORTALS]: string }>
}
