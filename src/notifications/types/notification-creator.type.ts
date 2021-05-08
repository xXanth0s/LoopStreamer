import { NotificationModel } from '../../store/models/notification.model';
import { StateModel } from '../../store/models/state.model';
import { Notifications } from '../constants/notifications.enum';

export interface NotificationCreator<T = never> {
    type: Notifications;
    (state: StateModel, data: T): NotificationModel | null;
}


export function createNotification<T = never>(type: Notifications, create: (state: StateModel, data: T) => NotificationModel | null): NotificationCreator<T> {
    const func = (state: StateModel, data: T) => create(state, data);

    func.type = type;

    return func;
}

