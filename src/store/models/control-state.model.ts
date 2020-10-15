import Providor from './providor.model';
import Series from './series.model';
import Portal from './portal.model';
import { LoopStreamerStatus } from '../enums/loop-streamer-status.enum';
import { BrowserWindowStateModel } from './browser-window-state.model';
import SeriesEpisode from './series-episode.model';


export interface ControlState {
    playedEpisodes: number;
    loopStreamerStatus: LoopStreamerStatus;
    activePortal?: Portal['key'];
    activeProvidor?: Providor['key'];
    activeEpisode?: SeriesEpisode['key']
    hasNextEpisode?: boolean;
    currentWindowState?: string;
    previousWindowState?: string;
    expandedSeriesOptionsPage?: Series['key'];
    controllerWindowState: {[key: string]: BrowserWindowStateModel}
}
