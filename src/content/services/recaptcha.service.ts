import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { fromEvent, Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import {
    checkForMutations,
    getDomElementSize,
    hideElement,
    isBodyElement,
    isDomElementVisible
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
            switchMap(container => this.checkForRecaptchaChallenge(container))
        ).subscribe(recaptchaElement => {
            this.hideNeighbourElementsWhenParentIsBody(recaptchaElement)
            fromEvent(window, 'resize').subscribe(() => recaptchaElement.scrollIntoView());

            const size = getDomElementSize(recaptchaElement);
            this.messageService.sendMessageToBackground(createRecaptchaRecognizedMessage(size));
        })
    }

    private checkForRecaptchaContainer(): Observable<HTMLElement> {
        const container = document.querySelector('body');

        return checkForMutations<HTMLElement>(container, this.recaptchaContainerSelector).pipe(first());
    }

    private checkForRecaptchaChallenge(container: HTMLElement): Observable<HTMLElement> {
        return checkForMutations<HTMLElement>(container, this.recaptchaContainerSelector).pipe(
            first(isDomElementVisible)
        );
    }

    private hideNeighbourElementsWhenParentIsBody(htmlElement: HTMLElement): void {
        const parent = htmlElement.parentElement;
        if(isBodyElement(parent)) {
            parent.childNodes.forEach(childElement => {
                if(childElement !== htmlElement
                    && childElement.nodeType === NodeTypes.ELEMENT_NODE) {
                    hideElement((childElement as HTMLElement));
                }
            })
        }
        else {
            this.hideNeighbourElementsWhenParentIsBody(parent);
        }
    }
}
