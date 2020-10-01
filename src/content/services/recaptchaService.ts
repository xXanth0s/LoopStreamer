import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';

@injectable()
export class RecaptchaService {

    private readonly reacaptchaSelecter = (): HTMLElement => document.getElementById('#rc-imageselect');

    constructor(@inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService) {
    }

    public checkForRecaptcha(): void {
        const bodyElement = document.querySelector('body');

        const config = { attributes: false, childList: true, subtree: true };

        const callback = (mutations: MutationRecord[], observer: MutationObserver) => {
            console.log(1)
            const recaptcha = this.reacaptchaSelecter();
            if (recaptcha) {
                console.error('recaptcha recognized')
                observer.disconnect();
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(bodyElement, config);
    }
}
