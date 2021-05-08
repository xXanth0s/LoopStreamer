import { StateModel } from '../models/state.model';
import { ControlState } from '../models/control-state.model';
import { WindowType } from '../enums/window-type.enum';
import { BrowserWindowStateModel } from '../models/browser-window-state.model';
import { Notifications } from '../../notifications/constants/notifications.enum';
import { NotificationModel } from '../models/notification.model';

export const getWindowIdForWindowType = (state: StateModel,
                                         windowType: WindowType): number => {
    return getWindowStateForWindowType(state, windowType)?.windowId;
};

export const getWindowStateForWindowType = (state: StateModel,
                                            windowType: BrowserWindowStateModel['key']): BrowserWindowStateModel => {
    return state.controlState.controllerWindowState[windowType];
};

export const getWindowStateForWindowId = (state: StateModel,
                                          windowId: BrowserWindowStateModel['windowId']) => {
    return getWindowStateForWindowIdWithControlstate(state.controlState, windowId);
};

export const getWindowStateForWindowIdWithControlstate = (state: ControlState,
                                                          windowId: BrowserWindowStateModel['windowId']) => {
    return Object.values(state.controllerWindowState).find(windowState => windowState?.windowId === windowId);
};

export const isMaximumPlayedEpisodesLimitReached = (state: StateModel): boolean => {
    const { playedEpisodes } = state.controlState;
    const { episodesToPlay } = state.options;

    return episodesToPlay !== 0 && playedEpisodes >= episodesToPlay;
};

export const getClosedNotificationsForWindowType = (state: StateModel, windowType: WindowType): Notifications[] => {
    return state.controlState.windowNotificationState[windowType]?.closedNotifications || [];
};

export const getActiveNotificationsForWindowType = (state: StateModel, windowType: WindowType): NotificationModel => {
    return state.controlState.windowNotificationState[windowType]?.activeNotification;
};
