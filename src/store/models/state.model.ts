import Options from './options.model';
import Portal from './portal.model';
import Providor from './providor.model';
import Series from './series.model';
import { ControlState } from './control-state.model';
import SeriesEpisode from './series-episode.model';
import { SeriesSeason } from './series-season.model';

export interface StateModel {
    controlState: ControlState;
    options: Options;
    portals: { [key: string]: Portal };
    providors: { [key: string]: Providor };
    series: { [key: string]: Series };
    lastWatchedSeries: Series['key'];
    seriesEpisodes: { [key: string]: SeriesEpisode };
    seriesSeasons: { [key: string]: SeriesSeason };
}
