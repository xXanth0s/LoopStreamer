import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Windows } from 'webextension-polyfill-ts';
import { ControlState } from '../models/control-state.model';
import { WindowType } from '../enums/window-type.enum';
import { StateModel } from '../models/state.model';
import { AsyncInteraction } from '../models/async-interaction.model';
import { getWindowStateForWindowIdWithControlstate } from '../selectors/control-state.selector';
import WindowState = Windows.WindowState;

const initialControlState: StateModel['controlState'] = {
    playedEpisodes: 0,
    controllerWindowState: {},
    asyncInteractions: {},
};

const resetControlState = (state: ControlState): ControlState => ({
    ...state,
    asyncInteractions: {},
    activeEpisode: '',
    playedEpisodes: 0,
});

function setWindowIdForWindowType(state: ControlState,
                                  { windowType, windowId }:
                                      { windowType: WindowType; windowId: number }): ControlState {
    const oldValue = state.controllerWindowState ? state.controllerWindowState[windowType] : {};

    return {
        ...state,
        controllerWindowState: {
            ...state.controllerWindowState,
            [windowType]: {
                ...oldValue,
                key: windowType,
                windowId,
            },
        },
    };
}

function setActiveEpisode(state: ControlState, activeEpsidoeKey: string): void {
    state.activeEpisode = activeEpsidoeKey;
}

function addAsyncInteraction(state: ControlState, asyncInteraction: AsyncInteraction<any>): void {
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

function setPictureInPictureState(state: ControlState, { isPictureInPicture }: { isPictureInPicture: boolean }): void {
    state.isVideoPictureInPicture = isPictureInPicture;
}

/* eslint-disable max-len */
export const controlStateSlice = createSlice({
    name: 'controlState',
    initialState: initialControlState as ControlState,
    reducers: {
        resetControlStateAction: (state: ControlState) => resetControlState(state),
        raisePlayedEpisodesAction: (state: ControlState) => raisePlayedEpisodes(state),
        resetPlayedEpisodesAction: (state: ControlState) => resetPlayedEpisodes(state),
        setWindowIdForWindowTypeAction: (state: ControlState, action: PayloadAction<{ windowType: WindowType; windowId: number }>) => setWindowIdForWindowType(state, action.payload),
        setActiveEpisodeAction: (state: ControlState, action: PayloadAction<ControlState['activeEpisode']>) => setActiveEpisode(state, action.payload),
        addAsyncInteractionAction: (state: ControlState, action: PayloadAction<AsyncInteraction<any>>) => addAsyncInteraction(state, action.payload),
        removeAsyncInteractionAction: (state: ControlState, action: PayloadAction<AsyncInteraction<any>['key']>) => removeAsyncInteraction(state, action.payload),
        setWindowStateAction: (state: ControlState, action: PayloadAction<{ windowId: number; windowState: WindowState }>) => setWindowState(state, action.payload),
        setWindowSizeAction: (state: ControlState, action: PayloadAction<{ windowId: number; height: number; width: number }>) => setWindowSize(state, action.payload),
        setPictureInPictureAction: (state: ControlState, action: PayloadAction<{ isPictureInPicture: boolean }>) => setPictureInPictureState(state, action.payload),
    },
});
/* eslint-enable max-len */

export const {
    resetControlStateAction,
    setWindowIdForWindowTypeAction,
    setActiveEpisodeAction,
    addAsyncInteractionAction,
    removeAsyncInteractionAction,
    setWindowStateAction,
    setWindowSizeAction,
    raisePlayedEpisodesAction,
    resetPlayedEpisodesAction,
    setPictureInPictureAction,
} = controlStateSlice.actions;
