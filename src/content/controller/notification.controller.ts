import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { getActiveNotificationsForWindowType } from '../../store/selectors/control-state.selector';
import { WindowType } from '../../store/enums/window-type.enum';
import { NotificationModel } from '../../store/models/notification.model';
import { CONTENT_TYPES } from '../container/CONTENT_TYPES';
import { NotificationService } from '../services/notification.service';

@injectable()
export class NotificationController {
    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(CONTENT_TYPES.NotificationService) private readonly notificationService: NotificationService) {
    }

    public start(): void {
        this.store.selectBehaviour(getActiveNotificationsForWindowType, WindowType.VIDEO)
            .subscribe(((notification: NotificationModel) => {
                if (notification) {
                    this.notificationService.openNotification(notification);
                } else {
                    this.notificationService.closeAllPopups();
                }
            }));
    }
}
