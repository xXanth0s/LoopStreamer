import {VIDEO_STATUS} from '../enums/video-status.enum';
import Providor from './providor.model';
import Series from './series.model';
import Portal from './portal.model';
import {LoopStreamerStatus} from '../enums/loop-streamer-status.enum';


export interface ControlState {
    videoStatus: VIDEO_STATUS;
    loopStreamerStatus: LoopStreamerStatus;
    isUserOnVideoPage: boolean;
    portalTabId?: number;
    videoTabId?: number;
    videoWindowId?: number;
    activePortal?: Portal['key'];
    activeProvidor?: Providor['key'];
    currentSeries?: Series['key'];
    hasNextEpisode?: boolean;
    hasPreviousEpisode?: boolean;
    activeVideoUrl?: string;
    currentWindowState?: string;
    previousWindowState?: string;
}
