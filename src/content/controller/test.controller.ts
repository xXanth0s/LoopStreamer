import { inject, injectable } from 'inversify';
import { ipcRenderer } from 'electron';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import { StartTestRecaptchaMessage, TestNotificationMessage } from '../../browserMessages/messages/test.messages';
import { CONTENT_TYPES } from '../container/CONTENT_TYPES';
import { NotificationService } from '../services/notification.service';
import { addVideoButtons } from '../html/video-button/video-buttons.component';
import SeriesEpisode from '../../store/models/series-episode.model';

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
            addVideoButtons({ key: '1983-S1-E3' } as SeriesEpisode);
        });
    }

    public executeRecaptchaChallenge(): void {
        const button = this.inivisibleButtonSelector();
        button?.click();
    }
}
