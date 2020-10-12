import { defer, fromEvent, MonoTypeOperatorFunction } from 'rxjs';
import { BrowserWindow } from 'electron';
import { mapTo, switchMap } from 'rxjs/operators';

export function waitTillPageLoadFinished(): MonoTypeOperatorFunction<BrowserWindow> {
    return $source => defer(() => {
        return $source.pipe(
            switchMap((window) => {
                return fromEvent<void>(window.webContents,'dom-ready').pipe(
                    mapTo(window),
                );
            } )
        )
    })
}
