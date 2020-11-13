import Series from './series.model';
import { LinkModel } from './link.model';

export interface SeriesSeason {
    key: string;
    seriesKey: Series['key'];
    seasonNumber: string;
    portalLinks: LinkModel['key'][];
}
