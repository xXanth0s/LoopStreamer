import { DomElementSize } from '../../dto/dom-element-size.model';

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
