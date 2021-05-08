import { WindowType } from '../enums/window-type.enum';
import { Notifications } from '../../notifications/constants/notifications.enum';
import { NotificationModel } from './notification.model';

export class WindowNotificationState {
    key: WindowType;
    closedNotifications: Notifications[];
    activeNotification: NotificationModel
}
