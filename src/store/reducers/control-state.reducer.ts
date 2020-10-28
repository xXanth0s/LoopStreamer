import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ControlState } from '../models/control-state.model';
import Portal from '../models/portal.model';
import Providor from '../models/providor.model';
import { PORTALS } from '../enums/portals.enum';
import { PROVIDORS } from '../enums/providors.enum';
import { WindowType } from '../enums/window-type.enum';
import { StateModel } from '../models/state.model';
import { AsyncInteraction } from '../models/async-interaction.model';
import { getWindowStateForWindowIdWithControlstate } from '../selectors/control-state.selector';
import { Windows } from 'webextension-polyfill-ts';
import Series from '../models/series.model';
import { deleteSeriesAction } from '../actions/shared.actions';
import WindowState = Windows.WindowState;

const initialControlState: StateModel['controlState'] = {
    activePortal: PORTALS.BS,
    activeProvidor: PROVIDORS.Vivo,
    playedEpisodes: 0,
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
        expandedSeriesApp: null,
    };
};

function toggleExpandedSeriesOptionsPage(state: ControlState, seriesToToggle: string): ControlState {
    const isAlreadySelected = state.expandedSeriesApp === seriesToToggle;
    return {
        ...state,
        expandedSeriesApp: isAlreadySelected ? null : seriesToToggle
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

function setActiveEpisode(state: ControlState, activeEpsidoeKey: string): void {
    state.activeEpisode = activeEpsidoeKey;
}

function addAsyncInteraction(state: ControlState, asyncInteraction: AsyncInteraction): void {
    state.asyncInteractions[asyncInteraction.key] = asyncInteraction;
}

function removeAsyncInteraction(state: ControlState, key: string): void {
    delete state.asyncInteractions[key];
}

function setWindowState(state: ControlState, payload: { windowId: number; windowState: WindowState }): void {
    const controllerWindowState = getWindowStateForWindowIdWithControlstate(state, payload.windowId);
    if (controllerWindowState) {
        controllerWindowState.windowState = payload.windowState;
    }
}

function setWindowSize(state: ControlState, payload: { windowId: number; height: number; width: number }): void {
    const { windowId, height, width } = payload;
    const controllerWindowState = getWindowStateForWindowIdWithControlstate(state, windowId);
    if (controllerWindowState) {
        controllerWindowState.height = height;
        controllerWindowState.width = width;
    }
}

function raisePlayedEpisodes(state: ControlState): void {
    state.playedEpisodes++;
}

function resetPlayedEpisodes(state: ControlState): void {
    state.playedEpisodes = 0;
}

function resetDataForDeletedSeries(state: StateModel['controlState'], seriesKey: string): void {
    if (state.expandedSeriesApp === seriesKey) {
        state.expandedSeriesApp = null;
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
        resetControlStateAction: (state: ControlState) =>
            resetControlState(state),
        raisePlayedEpisodesAction: (state: ControlState) =>
            raisePlayedEpisodes(state),
        resetPlayedEpisodesAction: (state: ControlState) =>
            resetPlayedEpisodes(state),
        toggleExpandedSeriesOptionsPageAction: (state: ControlState, action: PayloadAction<ControlState['expandedSeriesApp']>) =>
            toggleExpandedSeriesOptionsPage(state, action.payload),
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
    }, extraReducers: (builder) => {
        builder.addCase(deleteSeriesAction, (state: StateModel['controlState'], action: PayloadAction<Series['key']>) =>
            resetDataForDeletedSeries(state, action.payload));
    }
});

export const {
    updateControlStateAction,
    setActivePortalAction,
    setActiveProvidorAction,
    resetControlStateAction,
    toggleExpandedSeriesOptionsPageAction,
    setWindowIdForWindowTypeAction,
    setActiveEpisodeAction,
    addAsyncInteractionAction,
    removeAsyncInteractionAction,
    setWindowStateAction,
    setWindowSizeAction,
    raisePlayedEpisodesAction,
    resetPlayedEpisodesAction
} = controlStateSlice.actions;
