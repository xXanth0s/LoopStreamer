import { DomElementSize } from '../../dto/dom-element-size.model';
import { FULL_SCREEN_VIDEO_CSS_CLASS, HIDE_ELMENT_CSS_CLASS } from '../constants/class-names';

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
        height
    }
}

function getNumberFromPixelString(pixelString: string): number {
    const pixelRegex = /px/g;
    let value = +pixelString.replace(pixelRegex, '');

    return isNaN(value) ? 0 : value;
}

export function hideElement(htmlElement: HTMLElement): void {
    htmlElement.classList.add(HIDE_ELMENT_CSS_CLASS)
}

export function addFullscreenClass(nodeElement: HTMLElement): void {
    nodeElement.classList.add(FULL_SCREEN_VIDEO_CSS_CLASS);
}

export function isBodyElement(htmlElement: HTMLElement): boolean {
    return htmlElement === document.querySelector('body');
}
