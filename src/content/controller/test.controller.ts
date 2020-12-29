import { inject, injectable } from 'inversify';
import { ipcRenderer } from 'electron';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import { CONTENT_TYPES } from '../container/CONTENT_TYPES';
import { NotificationService } from '../services/notification.service';
import { addVideoButtons } from '../html/video-button/video-buttons.component';

@injectable()
export class TestController {
    private readonly inivisibleButtonSelector = (): HTMLElement => document.getElementById('invisible_button');

    constructor(@inject(CONTENT_TYPES.NotificationService) private readonly notificationService: NotificationService) {
    }

    public initialize(): void {
        ipcRenderer.on(MessageType.TEST_CONTENT_START_TEST_RECAPTCHA, () => {
            this.executeRecaptchaChallenge();
        });
        ipcRenderer.on(MessageType.TEST_CONTENT_START_TEST_NOTIFICATION, () => {
            this.notificationService.openTestPopup();
            addVideoButtons('1983-S1-E3');
        });
    }

    public executeRecaptchaChallenge(): void {
        const button = this.inivisibleButtonSelector();
        if (button) {
            button.click();
        }
    }
}
