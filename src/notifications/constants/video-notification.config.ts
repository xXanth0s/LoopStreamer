import { VideoNotificationCreator } from '../types/video-notification-creator.type';
import { setEndTimeNotification } from '../video/set-end-time.notification';
import { setStartTimeNotificationCreator } from '../video/set-start-time-notification.creator';

export const VideoNotificationsConfig: VideoNotificationCreator[] = [
    setStartTimeNotificationCreator,
    setEndTimeNotification,
];
