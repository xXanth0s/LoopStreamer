import { StateModel } from '../models/state.model';
import { ControlState } from '../models/control-state.model';
import { WindowType } from '../enums/window-type.enum';
import { BrowserWindowStateModel } from '../models/browser-window-state.model';

export const getWindowIdForWindowType = (state: StateModel, windowType: WindowType): number => getWindowStateForWindowType(state, windowType)?.windowId;

export const getWindowStateForWindowType = (state: StateModel, windowType: BrowserWindowStateModel['key']): BrowserWindowStateModel => state.controlState.controllerWindowState[windowType];

export const getWindowStateForWindowId = (state: StateModel, windowId: BrowserWindowStateModel['windowId']) => getWindowStateForWindowIdWithControlstate(state.controlState, windowId);

export const getWindowStateForWindowIdWithControlstate = (state: ControlState, windowId: BrowserWindowStateModel['windowId']) => Object.values(state.controllerWindowState).find(windowState => windowState?.windowId === windowId);

export const isMaximumPlayedEpisodesLimitReached = (state: StateModel): boolean => {
    const { playedEpisodes } = state.controlState;
    const { episodesToPlay } = state.options;

    return episodesToPlay !== 0 && playedEpisodes >= episodesToPlay;
};
