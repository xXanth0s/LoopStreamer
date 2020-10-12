import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getDomElementSize, isDomElementVisible } from '../ustils/dom.utils';
import { createRecaptchaRecognizedMessage } from '../../browserMessages/messages/background.messages';

@injectable()
export class RecaptchaService {

    private readonly recaptchaContainerSelector = (): HTMLIFrameElement => document.querySelector('iframe[title="recaptcha challenge"]');

    private readonly mutationObserverConfig: MutationObserverInit = { attributes: true, childList: true, subtree: true };

    constructor(@inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService) {
    }

    public checkForRecaptcha(): void {
        this.checkForRecaptchaContainer().pipe(
            switchMap(container => this.checkForRecaptchaChallenge(container))
        ).subscribe(recaptchaElement => {
            const size = getDomElementSize(recaptchaElement);
            this.messageService.sendMessageToBackground(createRecaptchaRecognizedMessage(size));
        })
    }

    private checkForRecaptchaContainer(): Observable<HTMLIFrameElement> {
        const sub$ = new Subject<HTMLIFrameElement>();
        const bodyElement = document.querySelector('body');

        const callback = () => {
            const recaptchaContainer = this.recaptchaContainerSelector();
            if (recaptchaContainer) {
                observer.disconnect();
                sub$.next(recaptchaContainer);
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(bodyElement, this.mutationObserverConfig);

        return sub$.asObservable();
    }

    private checkForRecaptchaChallenge(container: HTMLElement): Observable<HTMLElement> {
        const sub$ = new Subject<HTMLElement>();

        const callback = () => {
            if(isDomElementVisible(container)) {
                sub$.next(container);
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(container, this.mutationObserverConfig);
        return sub$.asObservable();
    }
}
