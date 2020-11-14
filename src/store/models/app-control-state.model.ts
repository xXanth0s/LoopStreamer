import Series from './series.model';
import { SeriesSeason } from './series-season.model';
import { PORTALS } from '../enums/portals.enum';
import { LANGUAGE } from '../enums/language.enum';

export default interface AppControlStateModel {
    activePortal?: PORTALS;
    selectedSeriesKey?: Series['key'];
    selectedSeason?: SeriesSeason['key'];
    selectedLanguage?: LANGUAGE;
}
