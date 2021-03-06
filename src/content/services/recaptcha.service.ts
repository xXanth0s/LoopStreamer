import { inject, injectable } from 'inversify';
import { asyncScheduler, fromEvent, Observable } from 'rxjs';
import { first, switchMap, throttleTime } from 'rxjs/operators';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import {
    checkForMutations, getDomElementSize, hideNotLsElement, isBodyElement,
} from '../ustils/dom.utils';
import { createRecaptchaRecognizedMessage } from '../../browserMessages/messages/background.messages';
import { NodeTypes } from '../../shared/enum/node-types.enum';

@injectable()
export class RecaptchaService {
    private readonly recaptchaContainerSelector = 'iframe[title="recaptcha challenge"]';

    constructor(@inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService) {
    }

    public checkForRecaptcha(): void {
        this.checkForRecaptchaContainer().pipe(
            switchMap(container => this.checkForRecaptchaChallenge(container)),
        ).subscribe(async recaptchaElement => {
            this.hideNeighbourElementsWhenParentIsBody(recaptchaElement);

            fromEvent(window, 'resize').pipe(
                throttleTime(300, asyncScheduler, { trailing: true }),
            ).subscribe(() => setTimeout(() => recaptchaElement.scrollIntoView()));

            const size = getDomElementSize(recaptchaElement);
            this.messageService.sendMessageToBackground(createRecaptchaRecognizedMessage(size));
        });
    }

    private checkForRecaptchaContainer(): Observable<HTMLElement> {
        const container = document.querySelector('body');

        return checkForMutations<HTMLElement>(container, this.recaptchaContainerSelector).pipe(first());
    }

    private checkForRecaptchaChallenge(container: HTMLElement): Observable<HTMLElement> {
        return checkForMutations<HTMLElement>(container, this.recaptchaContainerSelector).pipe(
        );
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
