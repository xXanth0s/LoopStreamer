import { VIDEO_STATUS } from '../enums/video-status.enum';
import Providor from './providor.model';
import Series from './series.model';
import Portal from './portal.model';
import { LoopStreamerStatus } from '../enums/loop-streamer-status.enum';
import { BrowserWindowStateModel } from './browser-window-state.model';


export interface ControlState {
    videoStatus: VIDEO_STATUS;
    loopStreamerStatus: LoopStreamerStatus;
    isUserOnVideoPage: boolean;
    activePortal?: Portal['key'];
    activeProvidor?: Providor['key'];
    currentSeries?: Series['key'];
    hasNextEpisode?: boolean;
    hasPreviousEpisode?: boolean;
    activeVideoUrl?: string;
    currentWindowState?: string;
    previousWindowState?: string;
    expandedSeriesOptionsPage?: Series['key'];
    controllerWindowState: {[key: string]: BrowserWindowStateModel}
}
