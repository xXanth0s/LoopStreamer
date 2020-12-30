export function mapArrayToObject<T, Key extends string & keyof T>(arrayData: Array<T>, key: Key): { [key: string]: T } {
    const result: { [key: string]: T } = {};
    arrayData.forEach(data => {
        result[`${data[key]}`] = data;
    });

    return result;
}

export function filterObject<T>(object: Record<keyof T, T>,
                                filterFunction: (filter: T) => boolean): Partial<Record<keyof T, T>> {
    return Object.entries<T>(object).reduce((accumulator, currentValue) => {
        if (filterFunction(currentValue[1])) {
            // eslint-disable-next-line prefer-destructuring
            accumulator[currentValue[0]] = currentValue[1];
        }

        return accumulator;
    }, {});
}
