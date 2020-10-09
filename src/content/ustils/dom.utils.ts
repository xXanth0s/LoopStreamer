export function isDomElementVisible(domElement: HTMLElement): boolean {
    const elemntStyles = window.getComputedStyle(domElement);

    return (elemntStyles.height !== '0px' || elemntStyles.width !== '0px') && elemntStyles.visibility === 'visible';
}
