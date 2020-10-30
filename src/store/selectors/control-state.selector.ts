import { StateModel } from '../models/state.model';
import { ControlState } from '../models/control-state.model';
import { WindowType } from '../enums/window-type.enum';
import { BrowserWindowStateModel } from '../models/browser-window-state.model';
import { AsyncInteractionType } from '../enums/async-interaction-type.enum';

export const getWindowIdForWindowType = (state: StateModel, windowType: WindowType): number => {
    return getWindowStateForWindowType(state, windowType)?.windowId;
};

export const getWindowStateForWindowType = (state: StateModel, windowType: BrowserWindowStateModel['key']): BrowserWindowStateModel => {
    return state.controlState.controllerWindowState[windowType];
};

export const getWindowStateForWindowId = (state: StateModel, windowId: BrowserWindowStateModel['windowId']) => {
    return getWindowStateForWindowIdWithControlstate(state.controlState, windowId);
};

export const getWindowStateForWindowIdWithControlstate = (state: ControlState, windowId: BrowserWindowStateModel['windowId']) => {
    return Object.values(state.controllerWindowState).find(windowState => windowState?.windowId === windowId);
};

export const isMaximumPlayedEpisodesLimitReached = (state: StateModel): boolean => {
    const playedEpisodes = state.controlState.playedEpisodes;
    const episodesToPlay = state.options.episodesToPlay;

    return episodesToPlay !== 0 && playedEpisodes >= episodesToPlay;
};

export const getActiveEpisode = (state: StateModel): ControlState['activeEpisode'] => state.controlState.activeEpisode;

export const hasAsyncInteractionForType = (state: StateModel, type: AsyncInteractionType): boolean => {
    return Object.values(state.controlState.asyncInteractions).some(interaction => interaction.type === type);
};

export const isPreparingVideo = (state: StateModel): boolean => {
    return hasAsyncInteractionForType(state, AsyncInteractionType.PORTAL_GET_EPISODE_INFO)
        || hasAsyncInteractionForType(state, AsyncInteractionType.VIDEO_OPEN_VIDEO);
};
