import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ControlState } from '../models/control-state.model';
import Portal from '../models/portal.model';
import Providor from '../models/providor.model';
import { LoopStreamerStatus } from '../enums/loop-streamer-status.enum';
import { VIDEO_STATUS } from '../enums/video-status.enum';
import { PORTALS } from '../enums/portals.enum';
import { PROVIDORS } from '../enums/providors.enum';

const initialControlState: ControlState = {
    "activePortal": PORTALS.BS,
    "activeProvidor": PROVIDORS.Vivo,
    "isUserOnVideoPage": false,
    "loopStreamerStatus": LoopStreamerStatus.PLAYING,
    "videoStatus": VIDEO_STATUS.None,
};

const updateControlState = function (state: ControlState, newControlState: Partial<ControlState>): ControlState {
    return {
        ...state,
        ...newControlState
    };
};

const setActivePortal = function (state: ControlState, activePortal: Portal['key']): ControlState {
    return {
        ...state,
        activePortal
    };
};

const setActivePortalTabId = function (state: ControlState, portalTabId: number): ControlState {
    return {
        ...state,
        portalTabId
    };
};

const setActiveProvidor = function (state: ControlState, activeProvidor: Providor['key']): ControlState {
    return {
        ...state,
        activeProvidor
    };
};

const setIsUserOnVideoPage = function (state: ControlState, isUserOnVideoPage: ControlState['isUserOnVideoPage']): ControlState {
    return {
        ...state,
        isUserOnVideoPage
    };
};

const resetControlState = (): ControlState => initialControlState;

const setOptionsWindowIdId = (state: ControlState, optionsWindowId: ControlState['optionsWindowId']): ControlState => {
    return {
        ...state,
        optionsWindowId
    }
};
const setVidoeTabId = (state: ControlState, videoTabId: ControlState['videoTabId']): ControlState => {
    return {
        ...state,
        videoTabId
    }
};

const setVideoWindowId = (state: ControlState, videoWindowId: ControlState['videoTabId']): ControlState => {
    return {
        ...state,
        videoWindowId
    }
};

const setLoopStreamerStatus = (state: ControlState, loopStreamerStatus: ControlState['loopStreamerStatus']): ControlState => {
    return {
        ...state,
        loopStreamerStatus
    }
};


const toggleWindowState = (state: ControlState): ControlState => {
    return {
        ...state,
        previousWindowState: state.currentWindowState,
        currentWindowState: state.previousWindowState
    }
};

const setCurrentWindowState = (state: ControlState, currentWindowState: ControlState['currentWindowState']): ControlState => {
    let previousWindowState =  'fullscreen';
    if(currentWindowState === 'fullscreen') {
        previousWindowState =  state.currentWindowState === 'fullscreen' ? state.previousWindowState : state.currentWindowState;
    }
    return {
        ...state,
        currentWindowState,
        previousWindowState
    }
};

function setExpandedSeriesOptionsPage(state: ControlState, expandedSeriesOptionsPage: string): ControlState {
    return {
        ...state,
        expandedSeriesOptionsPage
    }
}

export const controlStateSlice = createSlice({
    name: 'controlState',
    initialState: initialControlState as ControlState,
    reducers: {
        updateControlStateAction: (state: ControlState, action: PayloadAction<Partial<ControlState>>) => updateControlState(state, action.payload),
        setActivePortalAction: (state: ControlState, action: PayloadAction<Portal['key']>) => setActivePortal(state, action.payload),
        setActivePortalTabIdAction: (state: ControlState, action: PayloadAction<number>) => setActivePortalTabId(state, action.payload),
        setActiveProvidorAction: (state: ControlState, action: PayloadAction<Providor['key']>) => setActiveProvidor(state, action.payload),
        setOptionsWindowIdAction: (state: ControlState, action: PayloadAction<ControlState['optionsWindowId']>) => setOptionsWindowIdId(state, action.payload),
        setVidoeTabIdAction: (state: ControlState, action: PayloadAction<ControlState['videoTabId']>) => setVidoeTabId(state, action.payload),
        setActiveVideoWindowIdAction: (state: ControlState, action: PayloadAction<ControlState['videoWindowId']>) => setVideoWindowId(state, action.payload),
        setIsUserOnVideoPageAction: (state: ControlState, action: PayloadAction<ControlState['isUserOnVideoPage']>) => setIsUserOnVideoPage(state, action.payload),
        setLoopStreamerStatusAction: (state: ControlState, action: PayloadAction<ControlState['loopStreamerStatus']>) => setLoopStreamerStatus(state, action.payload),
        resetControlStateAction: () => resetControlState(),
        toggleWindowStateAction: (state: ControlState) => toggleWindowState(state),
        setCurrentWindowStateAction: (state: ControlState, action: PayloadAction<ControlState['currentWindowState']>) => setCurrentWindowState(state, action.payload),
        setExpandedSeriesOptionsPageAction: (state: ControlState, action: PayloadAction<ControlState['expandedSeriesOptionsPage']>) => setExpandedSeriesOptionsPage(state, action.payload),
    }
});

export const {
    updateControlStateAction,
    setOptionsWindowIdAction,
    setActivePortalAction,
    setActivePortalTabIdAction,
    setActiveProvidorAction,
    resetControlStateAction,
    setVidoeTabIdAction,
    setActiveVideoWindowIdAction,
    setIsUserOnVideoPageAction,
    setLoopStreamerStatusAction,
    toggleWindowStateAction,
    setCurrentWindowStateAction,
    setExpandedSeriesOptionsPageAction,
} = controlStateSlice.actions;
