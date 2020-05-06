import {StateModel} from '../models/state.model';
import {ControlState} from '../models/control-state.model';
import {LoopStreamerStatus} from '../enums/loop-streamer-status.enum';
import { Windows } from 'webextension-polyfill-ts';
import WindowState = Windows.WindowState;
import Series from '../models/series.model';

export const getControlState = (state: StateModel): ControlState => state.controlState;

export const isLoopStreamerInactive = (state: StateModel): boolean => {
    return state.controlState.loopStreamerStatus === LoopStreamerStatus.IDLE
        || state.controlState.loopStreamerStatus === LoopStreamerStatus.PAUSED
        || state.controlState.loopStreamerStatus === LoopStreamerStatus.PREPARING
        || state.controlState.loopStreamerStatus === LoopStreamerStatus.ERROR;
};



export const loopStreamerStatus = (state: StateModel): LoopStreamerStatus => state.controlState.loopStreamerStatus;

// @ts-ignore
export const getVideoTabId = (state: StateModel): number => state.controlState.videoTabId;

// @ts-ignore
export const getVideoWindowId = (state: StateModel): number => state.controlState.videoWindowId;

export const isVideoFullScreen = (state: StateModel): boolean => state.controlState.currentWindowState === 'fullscreen';

// @ts-ignore
export const previousWindowState = (state: StateModel): WindowState => state.controlState.previousWindowState;

export const isSeriesExpandedOnOptionsPage = (state: StateModel, seriesKey: Series['key']): boolean => {
    return state.controlState.expandedSeriesOptionsPage === seriesKey;
}
export const isAnySeriesExpandedOnOptionsPage = (state: StateModel, seriesKeys: Series['key'][]): boolean => {
    return seriesKeys.some(key => key === state.controlState.expandedSeriesOptionsPage);
}

