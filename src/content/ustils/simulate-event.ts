enum EventTypes {
    HTMLEvents = 'HTMLEvents',
    MouseEvents = 'MouseEvents'
}

const eventMatchers = {
    [EventTypes.HTMLEvents]: /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    [EventTypes.MouseEvents]: /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
};

export const simulateEvent = function(element: HTMLElement, eventName: string, eventOptions?: Partial<EventOptions>)
{
    const options = {...defaultOptions, ...eventOptions};
    let oEvent: MouseEvent | Event;
    let eventType: EventTypes;

    for (const name in EventTypes)
    {
        if (eventMatchers[name].test(eventName)) {
            eventType = name as EventTypes;
            break;
        }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent)
    {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents')
        {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }
        else
        {
            (oEvent as MouseEvent).initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    }
    else
    {
        // @ts-ignore
        const evt = document.createEventObject();
        oEvent = {...evt, ...options};
        // @ts-ignore
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
};

function extend(destination, source) {
    for (let property in source) {
        destination[property] = source[property];
    }
    return destination;
}


const defaultOptions: EventOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
};


export interface EventOptions {
    pointerX: number,
    pointerY: number,
    button: number,
    ctrlKey: boolean,
    altKey: boolean,
    shiftKey: boolean,
    metaKey: boolean,
    bubbles: boolean,
    cancelable: boolean,
}
