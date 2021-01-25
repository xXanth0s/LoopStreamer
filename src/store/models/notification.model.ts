import { PayloadAction } from '@reduxjs/toolkit';
import { Notifications } from '../../notifications/constants/notifications.enum';

export interface NotificationModel {
    key: Notifications;
    closable: boolean;
    buttons: NotificationButton[];
    duration: number;
    text: string;
    title: string;
    status: NotificationStatus;
    closeAction?: PayloadAction;
}

export interface NotificationButton<T = any> {
    text: string;
    clickAction: PayloadAction<T>;
}

export enum NotificationStatus {
    OPEN = 'open',
    CLOSED = 'closend',
    PENDING = 'pending',
}
