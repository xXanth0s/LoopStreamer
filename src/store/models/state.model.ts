import { Options } from './options.model';
import { Portal } from './portal.model';
import { Providor } from './providor.model';
import { Series } from './series.model';
import { ControlState } from './control-state.model';
import { SeriesEpisode } from './series-episode.model';
import { SeriesSeason } from './series-season.model';
import { PROVIDORS } from '../enums/providors.enum';
import { PORTALS } from '../enums/portals.enum';
import { AppControlStateModel } from './app-control-state.model';
import { LinkModel } from './link.model';
import { KeyRecord } from '../types/key.record.type';
import { Genre } from './genre.model';
import { SeriesMetaInfo } from './series-meta-info.model';

export interface StateModel {
    controlState: ControlState;
    appControlState: AppControlStateModel;
    options: Options;
    portals: Partial<Record<PORTALS, Portal>>;
    providors: Partial<Record<PROVIDORS, Providor>>;
    series: KeyRecord<Series>;
    seriesEpisodes: KeyRecord<SeriesEpisode>;
    seriesSeasons: KeyRecord<SeriesSeason>;
    watchedSeries: Series['key'][];
    links: KeyRecord<LinkModel>;
    genres: KeyRecord<Genre>;
    seriesMetaInfos: KeyRecord<SeriesMetaInfo>;
}
