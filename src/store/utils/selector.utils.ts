export const mapArrayToObject = function<T, Key extends string & keyof T>(arrayData: Array<T>, key: Key ): {[key: string]: T} {
    const result: {[key: string]: T} = {};
    arrayData.forEach(data => {
        result[`${data[key]}`] = data;
    });
    return result;
};
