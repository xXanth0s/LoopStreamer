import Series from './series.model';
import { SeriesSeason } from './series-season.model';
import { PORTALS } from '../enums/portals.enum';

export default interface AppControlStateModel {
    activePortal?: PORTALS;
    selectedSeriesKey?: Series['key'];
    selectedSeason?: SeriesSeason['key'];
}
