import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { WindowService } from '../services/window.service';
import { fromEvent, Observable, race, Subject, timer } from 'rxjs';
import Website from '../../store/models/website';
import { app, BrowserWindow, OnSendHeadersListenerDetails } from 'electron';
import { filter, map, mapTo, startWith, switchMap, takeUntil } from 'rxjs/operators';


type WebContensCreatedEvent = [ Event, BrowserWindow ];

@injectable()
export class WindowController {

    private readonly requestFilter = { urls: [ '*://*/*' ] };

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService) {
    }

    public openLinkForWebsite(allowedPage: Website, linkToOpen: string): Observable<BrowserWindow> {
        this.store.stopPlayer();
        const originalWindow = this.windowService.openWindow(linkToOpen, { nodeIntegration: false });
        return fromEvent<WebContensCreatedEvent>(app, 'browser-window-created').pipe(
            takeUntil(this.store.playerHasStopped()),
            map(data => data[1]),
            filter(Boolean),
            switchMap((window: BrowserWindow) => {
                return this.isWindowOpeningValidPage(window, allowedPage, linkToOpen).pipe(
                    map(isValid => {
                        if (isValid) {
                            this.windowService.addDefaultHandlingForNewWindow(window);
                            window.setParentWindow(originalWindow);
                            return window;
                        }
                        this.windowService.closeWindow(window.id);
                        return null;
                    }),
                );
            }),
            filter<BrowserWindow>(Boolean),
            startWith(originalWindow),
        );
    }

    private isWindowOpeningValidPage(window: BrowserWindow, allowedPage: Website, validLink: string): Observable<boolean> {
        const sub$ = new Subject<boolean>();
        const timeout$ = timer(100).pipe(
            mapTo(false)
        );

        window.webContents.session.webRequest.onSendHeaders(this.requestFilter, ({ resourceType, url }: OnSendHeadersListenerDetails): void => {
            if (resourceType !== 'mainFrame') {
                return;
            }
            if (window.isDestroyed()) {
                return;
            }

            window.webContents.session.webRequest.onSendHeaders(this.requestFilter, null);
            if (!this.isUrlValid(url, allowedPage, validLink)) {
                sub$.next(false);
            } else {
                sub$.next(true);
            }
        });

        return race(sub$, timeout$);
    }

    private isUrlValid(url: string, allowedPage: Website, validLink: string): boolean {
        const regex = new RegExp(allowedPage.urlRegex, 'i');

        return regex.test(url) || url.includes(validLink);
    }
}
