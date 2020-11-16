import { simulateEvent } from './simulate-event';

export function addGlobalFunctions() {
    // @ts-ignore
    window.simulateEvent = simulateEvent;
}
