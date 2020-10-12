import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { fromEvent, Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getDomElementSize, isDomElementVisible } from '../ustils/dom.utils';
import { createRecaptchaRecognizedMessage } from '../../browserMessages/messages/background.messages';
import { NodeTypes } from '../../shared/enum/node-types.enum';

@injectable()
export class RecaptchaService {

    private readonly recaptchaContainerSelector = (): HTMLIFrameElement => document.querySelector('iframe[title="recaptcha challenge"]');

    private readonly mutationObserverConfig: MutationObserverInit = { attributes: true, childList: true, subtree: true };
    private readonly invisibleCssClass = 'ls-invisible';

    constructor(@inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService) {
    }

    public checkForRecaptcha(): void {
        this.checkForRecaptchaContainer().pipe(
            switchMap(container => this.checkForRecaptchaChallenge(container))
        ).subscribe(recaptchaElement => {
            this.hideNeighbourElementsWhenParentIsBody(recaptchaElement)
            fromEvent(window, 'resize').subscribe(() => recaptchaElement.scrollIntoView());

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

    private hideNeighbourElementsWhenParentIsBody(htmlElement: HTMLElement): void {
        const parent = htmlElement.parentElement;
        if(this.isBodyElement(parent)) {
            parent.childNodes.forEach(childElement => {
                if(childElement !== htmlElement
                    && childElement.nodeType === NodeTypes.ELEMENT_NODE) {
                    (childElement as HTMLElement).classList.add(this.invisibleCssClass)
                }
            })
        }
        else {
            this.hideNeighbourElementsWhenParentIsBody(parent);
        }
    }

    private isBodyElement(htmlElement: HTMLElement): boolean {
        return htmlElement === document.querySelector('body');
    }
}
