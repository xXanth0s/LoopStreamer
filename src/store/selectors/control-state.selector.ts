import { StateModel } from '../models/state.model';
import { ControlState } from '../models/control-state.model';
import { WindowType } from '../enums/window-type.enum';
import { BrowserWindowStateModel } from '../models/browser-window-state.model';
import { AsyncInteractionType } from '../enums/async-interaction-type.enum';

export const getWindowIdForWindowType = (state: StateModel, windowType: WindowType): number => getWindowStateForWindowType(state, windowType)?.windowId;

export const getWindowStateForWindowType = (state: StateModel, windowType: BrowserWindowStateModel['key']): BrowserWindowStateModel => state.controlState.controllerWindowState[windowType];

export const getWindowStateForWindowId = (state: StateModel, windowId: BrowserWindowStateModel['windowId']) => getWindowStateForWindowIdWithControlstate(state.controlState, windowId);

export const getWindowStateForWindowIdWithControlstate = (state: ControlState, windowId: BrowserWindowStateModel['windowId']) => Object.values(state.controllerWindowState).find(windowState => windowState?.windowId === windowId);

export const isMaximumPlayedEpisodesLimitReached = (state: StateModel): boolean => {
    const { playedEpisodes } = state.controlState;
    const { episodesToPlay } = state.options;

    return episodesToPlay !== 0 && playedEpisodes >= episodesToPlay;
};

export const getActiveEpisode = (state: StateModel): ControlState['activeEpisode'] => state.controlState.activeEpisode;

export const hasAsyncInteractionForType = (state: StateModel, type: AsyncInteractionType): boolean => Object.values(state.controlState.asyncInteractions).some(interaction => interaction.type === type);

export const isPreparingVideo = (state: StateModel): boolean => hasAsyncInteractionForType(state, AsyncInteractionType.SAGA_START_EPISODE)
    || hasAsyncInteractionForType(state, AsyncInteractionType.SAGA_START_PREVIOUS_EPISODE)
    || hasAsyncInteractionForType(state, AsyncInteractionType.SAGA_START_NEXT_EPISODE)
    || hasAsyncInteractionForType(state, AsyncInteractionType.SAGA_START_CONTINUE_AUTOPLAY);

export const isLoadingSeason = (state: StateModel): boolean => hasAsyncInteractionForType(state, AsyncInteractionType.SAGA_LOADING_SEASON);

export const isLoadingSeries = (state: StateModel): boolean => hasAsyncInteractionForType(state, AsyncInteractionType.SAGA_LOADING_SERIES);
