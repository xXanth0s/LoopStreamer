import { defer, fromEvent, MonoTypeOperatorFunction, Observable, } from 'rxjs';
import { BrowserWindow } from 'electron';
import { finalize, mapTo, switchMap, tap, } from 'rxjs/operators';

export function waitTillPageLoadFinished(): MonoTypeOperatorFunction<BrowserWindow> {
    return $source => defer(() => $source.pipe(
        switchMap((window) => fromEvent<void>(window.webContents, 'dom-ready').pipe(
            mapTo(window),
        )),
    ));
}

export function finalizeWithValue<T>(callback: (value: T) => void): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>) => defer(() => {
        let lastValue: T;
        return source.pipe(
            tap(value => lastValue = value),
            finalize(() => callback(lastValue)),
        );
    });
}
