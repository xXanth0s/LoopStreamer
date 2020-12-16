import { Observable, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DomElementSize } from '../../dto/dom-element-size.model';
import {
    FULL_SCREEN_VIDEO_CSS_CLASS,
    HIDE_ELMENT_CSS_CLASS,
    LS_CONTENT_CONTAINER,
    VIDEO_IN_VIDEO_CSS_CLASS,
} from '../constants/class-names';
import Providor from '../../store/models/providor.model';
import { ProvidorLink } from '../../background/models/providor-link.model';

export function isDomElementVisible(domElement: HTMLElement): boolean {
    const elemntStyles = window.getComputedStyle(domElement);
    const size = getDomElementSize(domElement);

    return size.width && size.height && elemntStyles.visibility === 'visible';
}

export function getDomElementSize(domElement: HTMLElement): DomElementSize {
    const elemntStyles = window.getComputedStyle(domElement);

    const height = getNumberFromPixelString(elemntStyles.height);
    const width = getNumberFromPixelString(elemntStyles.width);

    return {
        width,
        height,
    };
}

function getNumberFromPixelString(pixelString: string): number {
    const pixelRegex = /px/g;
    const value = +pixelString.replace(pixelRegex, '');

    return isNaN(value) ? 0 : value;
}

export function hideNotLsElement(htmlElement: HTMLElement): void {
    if (!htmlElement.classList.contains(LS_CONTENT_CONTAINER)) {
        htmlElement.classList.add(HIDE_ELMENT_CSS_CLASS);
    }
}

export function addFullscreenClass(nodeElement: HTMLElement): void {
    nodeElement.classList.add(FULL_SCREEN_VIDEO_CSS_CLASS);
}

export function addClassForVideoInVideoClass(nodeElement: HTMLElement): void {
    nodeElement.classList.add(VIDEO_IN_VIDEO_CSS_CLASS);
}

export function isBodyElement(htmlElement: HTMLElement): boolean {
    return htmlElement === document.querySelector('body');
}

export function checkForMutations<T extends Element>(container: Node, selector: string): Observable<T> {
    const mutationObserverConfig = { attributes: true, childList: true, subtree: true };
    const sub$ = new Subject<T>();

    const callback = () => {
        const container = document.querySelector<T>(selector);
        if (container) {
            sub$.next(container);
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(container, mutationObserverConfig);

    return sub$.asObservable().pipe(
        finalize(() => observer.disconnect()),
    );
}

export function isPictureInPicture(): boolean {
    // @ts-ignore
    return Boolean(document.pictureInPictureElement);
}

export function getElementWithTitle<T extends Element>(element: Element, titles: string[]): T {
    let result: T = null;
    for (const title of titles) {
        result = element.querySelector(`[title^="${title}" i]`);
    }

    return result;
}

export function getLinksForProviders(providers: Providor[], providorContainer?: HTMLElement): ProvidorLink[] {
    const container = providorContainer || document.body;
    return providers.map(providor => {
        const linkElement = getLinkWithText(container, providor.names) || getElementWithTitle(container, providor.names);
        if (linkElement) {
            return {
                link: linkElement.href,
                providor: providor.key,
            };
        }
    }).filter(Boolean);
}

export function getLinkWithText(containerElement: Element, textPossibilities: string[]): HTMLAnchorElement {
    const links: HTMLAnchorElement[] = Array.from(containerElement.querySelectorAll('a'));
    const lowerCaseTextPossibilities = textPossibilities.map(text => text.toLowerCase());
    const filteredLinks = links.filter(link => {
        const content = link.textContent.toLowerCase();
        return lowerCaseTextPossibilities.some(text => content.includes(text));
    });

    if (filteredLinks.length > 1) {
        return links.find(link => {
            const content = link.textContent.toLowerCase();
            return lowerCaseTextPossibilities.some(text => content === text);
        });
    }

    return filteredLinks[0];

}
