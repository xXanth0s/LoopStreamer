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

const resetControlState = (): ControlState => initialControlState;

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
    }
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

export const controlStateSlice = createSlice({
    name: 'controlState',
    initialState: initialControlState as ControlState,
    reducers: {
        updateControlStateAction: (state: ControlState, action: PayloadAction<Partial<ControlState>>) => updateControlState(state, action.payload),
        setActivePortalAction: (state: ControlState, action: PayloadAction<Portal['key']>) => setActivePortal(state, action.payload),
        setActiveProvidorAction: (state: ControlState, action: PayloadAction<Providor['key']>) => setActiveProvidor(state, action.payload),
        setLoopStreamerStatusAction: (state: ControlState, action: PayloadAction<ControlState['loopStreamerStatus']>) => setLoopStreamerStatus(state, action.payload),
        resetControlStateAction: () => resetControlState(),
        toggleWindowStateAction: (state: ControlState) => toggleWindowState(state),
        setCurrentWindowStateAction: (state: ControlState, action: PayloadAction<ControlState['currentWindowState']>) => setCurrentWindowState(state, action.payload),
        setExpandedSeriesOptionsPageAction: (state: ControlState, action: PayloadAction<ControlState['expandedSeriesOptionsPage']>) => setExpandedSeriesOptionsPage(state, action.payload),
        setWindowIdForWindowTypeAction: (state: ControlState, action: PayloadAction<{ windowType: WindowType, windowId: number }>) => setWindowIdForWindowType(state, action.payload),
        setActiveEpisodeAction: (state: ControlState, action: PayloadAction<ControlState['activeEpisode']>) => setActiveEpisode(state, action.payload),
        addAsyncInteractionAction: (state: ControlState, action: PayloadAction<AsyncInteraction>) => addAsyncInteraction(state, action.payload),
        removeAsyncInteractionAction: (state: ControlState, action: PayloadAction<AsyncInteraction['key']>) => removeAsyncInteraction(state, action.payload),
    }
});

export const {
    updateControlStateAction,
    setActiveProvidorAction,
    resetControlStateAction,
    setLoopStreamerStatusAction,
    toggleWindowStateAction,
    setCurrentWindowStateAction,
    setExpandedSeriesOptionsPageAction,
    setWindowIdForWindowTypeAction,
    setActiveEpisodeAction,
    addAsyncInteractionAction,
    removeAsyncInteractionAction,
} = controlStateSlice.actions;
