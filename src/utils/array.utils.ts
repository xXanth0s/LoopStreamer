export function convertArrayToChunks<T>(data: Array<T>,
                                        length: number): T[][] {
    return data.reduce((result, value, currentIndex) => {
        const index = Math.floor(currentIndex / length);
        const previous = result[index] || [];

        // eslint-disable-next-line no-param-reassign
        result[index] = [
            ...previous,
            value,
        ];
        return result;
    }, []);
}

export function sortArrayForKey<T, P>(array: Array<T>, getValue: (T) => P): T[] {
    return array.sort((a, b) => {
        const valA = getValue(a);
        const valB = getValue(b);
        if (valA < valB) {
            return -1;
        }
        if (valA > valB) {
            return 1;
        }
        return 0;
    });
}

export function addToArrayIfNotExists<T>(array: T[] = [], elementToAdd: T): T[] {
    if (!elementToAdd || array.includes(elementToAdd)) {
        return array;
    }

    return [
        ...array,
        elementToAdd,
    ];
}

export function removeDuplicatesFromArray<T>(array: T[]): T[] {
    return [ ...new Set(array) ];
}

export function reduceArraySize<T>(array: T[], size: number): T[] {
    const copy = [ ...array ];
    copy.length = size;
    return copy.filter(Boolean);
}
