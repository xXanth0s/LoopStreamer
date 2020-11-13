export function convertArrayToChunks<T>(data: Array<T>, length: number): T[][] {
    return data.reduce((result, value, currentIndex) => {
        const index = Math.floor(currentIndex / length);
        const previous = result[index] || [];
        result[index] = [
            ...previous,
            value
        ];
        return result;
    }, []);
}

export function sortArrayForKey<T>(array: Array<T>, getValue: (T) => any): T[] {
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
