import { Observable, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DomElementSize } from '../../dto/dom-element-size.model';
import {
    FULL_SCREEN_VIDEO_CSS_CLASS,
    HIDE_ELMENT_CSS_CLASS,
    LS_CONTENT_CONTAINER,
    VIDEO_IN_VIDEO_CSS_CLASS,
} from '../constants/class-names';
import { Providor } from '../../store/models/providor.model';
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

    return Number.isNaN(value) ? 0 : value;
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
        const nodeContainer = document.querySelector<T>(selector);
        if (nodeContainer) {
            sub$.next(nodeContainer);
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(container, mutationObserverConfig);

    return sub$.asObservable().pipe(
        finalize(() => observer.disconnect()),
    );
}

export function getPictureInPictureState(): boolean {
    // @ts-ignore
    return Boolean(document.pictureInPictureElement);
}

export function getElementWithTitle<T extends Element>(element: Element, titles: string[]): T {
    let result: T = null;
    titles.forEach(title => {
        result = element.querySelector(`[title^="${title}" i]`);
    });

    return result;
}

export function getLinksForProviders(providers: Providor[], providorContainer?: HTMLElement): ProvidorLink[] {
    const container = providorContainer || document.body;
    return providers.map(providor => {
        const linkElement = getLinkWithText(providor.names, container)
            || getElementWithTitle(container, providor.names);
        console.log(`link for provider ${providor}: ${linkElement.href}`);
        if (linkElement) {
            return {
                link: linkElement.href,
                providor: providor.key,
            };
        }

        return null;
    }).filter(Boolean);
}

export function getAllLinksWithTextOrProperty(textPossibilities: string[],
                                              containerElement?: Element): HTMLAnchorElement[] {
    return textPossibilities.flatMap(linkText => {
        const nestedElementsXpath = `//a[@*[contains(., '${linkText}')] or .//@*[contains(., '${linkText}')]]`;
        return getAllElementsByXPath<HTMLAnchorElement>(nestedElementsXpath, containerElement);
    }).filter(Boolean);
}

export function getLinkWithText(textPossibilities: string[], containerElement?: Element): HTMLAnchorElement {
    const allLinks = getAllLinksWithTextOrProperty(textPossibilities, containerElement);
    return allLinks[0];
}

(() => {
    // @ts-ignore
    window.domUtils = this;
})();

export function getAllElementsByXPath<T extends HTMLElement>(xpath: string, parent?: Element): T[] {
    const results = [];
    const query = document.evaluate(xpath, parent || document,
                                    null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0, length = query.snapshotLength; i < length; ++i) {
        results.push(query.snapshotItem(i));
    }
    return results;
}
