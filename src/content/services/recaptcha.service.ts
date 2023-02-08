import { inject, injectable } from 'inversify';
import { asyncScheduler, fromEvent, Observable } from 'rxjs';
import { first, switchMap, throttleTime } from 'rxjs/operators';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import {
    checkForMutationsXpath,
    getDomElementSize,
    hideNotLsElement,
    isBodyElement,
} from '../ustils/dom.utils';
import {
    createRecaptchaRecognizedMessage,
} from '../../browserMessages/messages/background.messages';
import { NodeTypes } from '../../shared/enum/node-types.enum';

@injectable()
export class RecaptchaService {
    constructor(@inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService) {
    }

    public checkForRecaptcha(): void {
        this.checkForRecaptchaContainer().pipe(
            switchMap(() => this.checkForRecaptchaContainer()),
        ).subscribe(async recaptchaElement => {
            const size = getDomElementSize(recaptchaElement);
            if (size.height < 100 || size.width < 100) {
                return;
            }
            this.hideNeighbourElementsWhenParentIsBody(recaptchaElement);

            fromEvent(window, 'resize').pipe(
                throttleTime(300, asyncScheduler, { trailing: true }),
            ).subscribe(() => setTimeout(() => recaptchaElement.scrollIntoView()));

            this.messageService.sendMessageToBackground(createRecaptchaRecognizedMessage(size));
        });
    }

    private checkForRecaptchaContainer(): Observable<HTMLElement> {
        const container = document.querySelector('body');
        return checkForMutationsXpath<HTMLIFrameElement>(container, {
            containerElementSelectors: [ 'iframe' ],
            textPossibilities: [ 'recaptcha ' ],
        }).pipe(first());
    }

    private hideNeighbourElementsWhenParentIsBody(htmlElement: HTMLElement): void {
        const parent = htmlElement.parentElement;
        if (isBodyElement(parent)) {
            parent.childNodes.forEach(childElement => {
                if (childElement !== htmlElement
                    && childElement.nodeType === NodeTypes.ELEMENT_NODE) {
                    hideNotLsElement((childElement as HTMLElement));
                }
            });
        } else {
            this.hideNeighbourElementsWhenParentIsBody(parent);
        }
    }
}
