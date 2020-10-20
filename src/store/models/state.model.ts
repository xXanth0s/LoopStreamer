import Options from './options.model';
import Portal from './portal.model';
import Providor from './providor.model';
import Series from './series.model';
import { ControlState } from './control-state.model';
import SeriesEpisode from './series-episode.model';
import { SeriesSeason } from './series-season.model';
import { PROVIDORS } from '../enums/providors.enum';
import { PORTALS } from '../enums/portals.enum';

export interface StateModel {
    controlState: ControlState;
    options: Options;
    portals: Record<PORTALS, Portal>;
    providors: Record<PROVIDORS, Providor>;
    series: Record<Series['key'], Series>;
    lastWatchedSeries: Series['key'];
    seriesEpisodes: Record<SeriesEpisode['key'], SeriesEpisode>;
    seriesSeasons: Record<SeriesSeason['key'], SeriesSeason>;
}
