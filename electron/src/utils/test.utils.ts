export const mockService = <T>(constructor: new (...args: any[]) => T, spyObject?: jest.Mocked<T>): jest.Mocked<T> => {
    const prototype = constructor.prototype;

    const spyObj = spyObject || {} as jest.Mocked<T>;
    Object.keys(prototype).forEach(property => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
        if (descriptor === undefined) {
            return;
        }
        if (isSpy(descriptor)) {
            // @ts-ignore
            spyObj[property] = prototype[property];
        }
        else if (descriptor.value !== undefined) {
            const spy = jest.spyOn(prototype, property);
            spy.mockReturnValue(undefined);
            // @ts-ignore
            spyObj[property] = spy;
        }
        else if (descriptor.get !== undefined) {
            // @ts-ignore
            spyObj[property] = jest.spyOn(prototype, property, 'get');
        }
    });
    const inheritance = Object.getPrototypeOf(constructor);
    if (inheritance.prototype && Object.keys(inheritance.prototype).length !== 0) {
        return mockService(inheritance, spyObj);
    }
    return spyObj;
};

export const isSpy = (descriptor: PropertyDescriptor): boolean => {
    if (descriptor.value === undefined) {
        return false;
    }
    const spyFields = ['and', 'calls'];
    const missingField = spyFields
        .find(spyField => Object.getOwnPropertyDescriptor(descriptor.value, spyField) === undefined);
    return missingField === undefined;
};

