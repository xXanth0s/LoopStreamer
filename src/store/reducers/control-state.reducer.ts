import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ControlState } from '../models/control-state.model';
import Portal from '../models/portal.model';
import Providor from '../models/providor.model';
import { LoopStreamerStatus } from '../enums/loop-streamer-status.enum';
import { PORTALS } from '../enums/portals.enum';
import { PROVIDORS } from '../enums/providors.enum';
import { WindowType } from '../enums/window-type.enum';
import { StateModel } from '../models/state.model';
import { AsyncInteraction } from '../models/async-interaction.model';
import { getWindowStateForWindowIdWithControlstate } from '../selectors/control-state.selector';
import { Windows } from 'webextension-polyfill-ts';
import WindowState = Windows.WindowState;

const initialControlState: StateModel['controlState'] = {
    activePortal: PORTALS.BS,
    activeProvidor: PROVIDORS.Vivo,
    playedEpisodes: 0,
    loopStreamerStatus: LoopStreamerStatus.PLAYING,
    controllerWindowState: {},
    asyncInteractions: {},
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
const setActiveProvidor = function (state: ControlState, activeProvidor: Providor['key']): ControlState {
    return {
        ...state,
        activeProvidor
    };
};

const resetControlState = (state: ControlState): ControlState => {
    return {
        ...state,
        asyncInteractions: {},
        activeEpisode: '',
        playedEpisodes: 0,
        activePortal: null,
        activeProvidor: null,
        expandedSeriesOptionsPage: null,
    };
};

const setLoopStreamerStatus = (state: ControlState, loopStreamerStatus: ControlState['loopStreamerStatus']): ControlState => {
    return {
        ...state,
        loopStreamerStatus
    };
};

function setExpandedSeriesOptionsPage(state: ControlState, expandedSeriesOptionsPage: string): ControlState {
    return {
        ...state,
        expandedSeriesOptionsPage
    };
}

function setWindowIdForWindowType(state: ControlState, { windowType, windowId }: { windowType: WindowType; windowId: number }): ControlState {
    const oldValue = state.controllerWindowState ? state.controllerWindowState[windowType] : {};

    return {
        ...state,
        controllerWindowState: {
            ...state.controllerWindowState,
            [windowType]: {
                ...oldValue,
                key: windowType,
                windowId
            }
        }
    };
}

function setActiveEpisode(state: ControlState, activeEpsidoeKey: string) {
    state.activeEpisode = activeEpsidoeKey;
}

function addAsyncInteraction(state: ControlState, asyncInteraction: AsyncInteraction): void {
    state.asyncInteractions[asyncInteraction.key] = asyncInteraction;
}

function removeAsyncInteraction(state: ControlState, key: string): void {
    delete state.asyncInteractions[key];
}

function setWindowState(state: ControlState, payload: { windowId: number; windowState: WindowState }) {
    const controllerWindowState = getWindowStateForWindowIdWithControlstate(state, payload.windowId);
    if (controllerWindowState) {
        controllerWindowState.windowState = payload.windowState;
    }
}

function setWindowSize(state: ControlState, payload: { windowId: number; height: number; width: number }) {
    const { windowId, height, width } = payload;
    const controllerWindowState = getWindowStateForWindowIdWithControlstate(state, windowId);
    if (controllerWindowState) {
        controllerWindowState.height = height;
        controllerWindowState.width = width;
    }
}

export const controlStateSlice = createSlice({
    name: 'controlState',
    initialState: initialControlState as ControlState,
    reducers: {
        updateControlStateAction: (state: ControlState, action: PayloadAction<Partial<ControlState>>) =>
            updateControlState(state, action.payload),
        setActivePortalAction: (state: ControlState, action: PayloadAction<Portal['key']>) =>
            setActivePortal(state, action.payload),
        setActiveProvidorAction: (state: ControlState, action: PayloadAction<Providor['key']>) =>
            setActiveProvidor(state, action.payload),
        setLoopStreamerStatusAction: (state: ControlState, action: PayloadAction<ControlState['loopStreamerStatus']>) =>
            setLoopStreamerStatus(state, action.payload),
        resetControlStateAction: (state: ControlState) =>
            resetControlState(state),
        setExpandedSeriesOptionsPageAction: (state: ControlState, action: PayloadAction<ControlState['expandedSeriesOptionsPage']>) =>
            setExpandedSeriesOptionsPage(state, action.payload),
        setWindowIdForWindowTypeAction: (state: ControlState, action: PayloadAction<{ windowType: WindowType, windowId: number }>) =>
            setWindowIdForWindowType(state, action.payload),
        setActiveEpisodeAction: (state: ControlState, action: PayloadAction<ControlState['activeEpisode']>) =>
            setActiveEpisode(state, action.payload),
        addAsyncInteractionAction: (state: ControlState, action: PayloadAction<AsyncInteraction>) =>
            addAsyncInteraction(state, action.payload),
        removeAsyncInteractionAction: (state: ControlState, action: PayloadAction<AsyncInteraction['key']>) =>
            removeAsyncInteraction(state, action.payload),
        setWindowStateAction: (state: ControlState, action: PayloadAction<{ windowId: number, windowState: WindowState }>) =>
            setWindowState(state, action.payload),
        setWindowSizeAction: (state: ControlState, action: PayloadAction<{ windowId: number, height: number, width: number }>) =>
            setWindowSize(state, action.payload),
    }
});

export const {
    updateControlStateAction,
    setActiveProvidorAction,
    resetControlStateAction,
    setLoopStreamerStatusAction,
    setExpandedSeriesOptionsPageAction,
    setWindowIdForWindowTypeAction,
    setActiveEpisodeAction,
    addAsyncInteractionAction,
    removeAsyncInteractionAction,
    setWindowStateAction,
    setWindowSizeAction
} = controlStateSlice.actions;
