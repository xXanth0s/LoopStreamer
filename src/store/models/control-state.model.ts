import { Dictionary } from '@reduxjs/toolkit';
import { BrowserWindowStateModel } from './browser-window-state.model';
import { SeriesEpisode } from './series-episode.model';
import { AsyncInteraction } from './async-interaction.model';
import { WindowType } from '../enums/window-type.enum';
import { KeyRecord } from '../types/key.record.type';
import { NotificationModel } from './notification.model';
import { KeyDictionary } from '../types/dictionary.type';
import { WindowNotificationState } from './window-notification-state.model';

export interface ControlState {
    playedEpisodes: number;
    activeEpisode?: SeriesEpisode['key'];
    asyncInteractions: KeyRecord<AsyncInteraction<any>>;
    controllerWindowState: KeyDictionary<BrowserWindowStateModel>;
    isVideoPictureInPicture?: boolean;
    windowNotificationState: KeyDictionary<WindowNotificationState>;
}
