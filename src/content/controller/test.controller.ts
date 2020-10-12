import { inject, injectable } from 'inversify';
import { ipcRenderer } from 'electron';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import { StartTestRecaptchaMessage, TestNotificationMessage } from '../../browserMessages/messages/test.messages';
import { CONTENT_TYPES } from '../container/CONTENT_TYPES';
import { NotificationService } from '../services/notification.service';

@injectable()
export class TestController {

    private readonly inivisibleButtonSelector = (): HTMLElement => document.getElementById('invisible_button');

    constructor(@inject(CONTENT_TYPES.NotificationService) private readonly notificationService: NotificationService) {
    }

    public initialize(): void {
        ipcRenderer.on(MessageType.TEST_CONTENT_START_TEST_RECAPTCHA, (event, message: StartTestRecaptchaMessage) => {
            this.executeRecaptchaChallenge();
        });
        ipcRenderer.on(MessageType.TEST_CONTENT_START_TEST_NOTIFICATION, (event, message: TestNotificationMessage) => {
            this.notificationService.openEndTimePopup(() => {}, () => {});
        });
    }

    public executeRecaptchaChallenge(): void {
        const button = this.inivisibleButtonSelector();
        button?.click();
    }
}
