import { MonoTypeOperatorFunction, defer, fromEvent } from 'rxjs';
import { BrowserWindow } from 'electron';
import { switchMap, mapTo, tap } from 'rxjs/operators';

export function waitTillPageLoadFinished(): MonoTypeOperatorFunction<BrowserWindow> {
    return $source => defer(() => {
        return $source.pipe(
            switchMap((window) => {
                return fromEvent<void>(window.webContents,'dom-ready').pipe(
                    tap(() => console.log('window loaded')),
                    mapTo(window),
                );
            } )
        )
    })
}
