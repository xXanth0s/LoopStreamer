import { put, select } from 'redux-saga/effects';
import { setActiveNotificationAction } from 'src/store/reducers/control-state.reducer';
import { StateModel } from '../../models/state.model';
import { NotificationModel } from '../../models/notification.model';
import { VideoNotificationsConfig } from '../../../notifications/constants/video-notification.config';
import {
    getActiveNotificationsForWindowType,
    getClosedNotificationsForWindowType,
} from '../../selectors/control-state.selector';
import { SeriesEpisode } from '../../models/series-episode.model';
import { WindowType } from '../../enums/window-type.enum';

export function* videoNotificationSaga(episodeKey: SeriesEpisode['key']) {
    const state = yield select();
    const notification = getNotificationsToOpen(state, episodeKey);

    const activeNotification = getActiveNotificationsForWindowType(state, WindowType.VIDEO);

    if (activeNotification?.key !== notification?.key) {
        yield put(setActiveNotificationAction({
            notification: activeNotification,
            window: WindowType.VIDEO,
        }));
    }
}

function getNotificationsToOpen(state: StateModel, episodeKey: SeriesEpisode['key']): NotificationModel {
    const closedNotifications = getClosedNotificationsForWindowType(state, WindowType.VIDEO);
    const possibleNotifications = VideoNotificationsConfig.filter(notificationCreator => {
        return closedNotifications.some(notification => notification !== notificationCreator.type);
    });

    return possibleNotifications.map(notification => notification(state, { episodeKey })).find(Boolean);
}
