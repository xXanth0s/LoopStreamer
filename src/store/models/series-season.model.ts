import Series from './series.model';
import { PORTALS } from '../enums/portals.enum';
import { LinkModel } from './link.model';

export interface SeriesSeason {
    key: string;
    seriesKey: Series['key'];
    seasonNumber: string;
    portalLinks: Partial<{ [key in PORTALS]: string }>
}
