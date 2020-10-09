import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { getVideoWindowId } from '../../store/selectors/control-state.selector';
import { setCurrentWindowStateAction } from '../../store/reducers/control-state.reducer';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { ProvidorService } from '../services/providor.service';
import { PortalService } from '../services/portalService';
import { WindowService } from '../services/window.service';
import { fromEvent, Observable, race, Subject, timer } from 'rxjs';
import Website from '../../store/models/website';
import { app, BrowserWindow, OnSendHeadersListenerDetails } from 'electron';
import { filter, map, mapTo, startWith, switchMap, takeUntil } from 'rxjs/operators';


type WebContensCreatedEvent = [ Event, BrowserWindow ];

@injectable()
export class WindowController {

    private readonly requestFilter = { urls: [ '*://*/*' ] };

    private isUserOnVideoTabVal = false;

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(BACKGROUND_TYPES.ProvidorService) private readonly providorService: ProvidorService,
                @inject(BACKGROUND_TYPES.PortalService) private readonly portalService: PortalService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService) {
    }

    public async setCurrentWindowState(): Promise<void> {
        // const activeWindow = await this.getVideoWindow();
        // this.store.dispatch(setCurrentWindowStateAction(activeWindow?.state));
    }

    public async makeWindowFullscreen(): Promise<void> {
        const windowId = this.store.selectSync(getVideoWindowId);
        if (windowId) {
            this.store.dispatch(setCurrentWindowStateAction('fullscreen'));
        } else {
            console.error('WindowController.makeWindowFullscreen: No videoWindowId provided');
        }
    }

    public async toggleWindowState(): Promise<void> {
        // const activeWindow = await this.getVideoWindow();
        // const isFullscreen = activeWindow.state === 'fullscreen';
        // const oldWindowState = this.store.selectSync(previousWindowState);
        //
        // this.store.dispatch(toggleWindowStateAction());
        //
        // const newWindowState: WindowState = isFullscreen ? oldWindowState : 'fullscreen';

        // await chrome.windows.update(activeWindow.id, {state: newWindowState});
    }

    public openLinkForWebsite(allowedPage: Website, linkToOpen: string): Observable<BrowserWindow> {
        this.store.stopPlayer();
        const originalWindow = this.windowService.openWindow(linkToOpen, { visible: true, nodeIntegration: false });
        return fromEvent<WebContensCreatedEvent>(app, 'browser-window-created').pipe(
            takeUntil(this.store.playerHasStopped()),
            map(data => data[1]),
            filter(Boolean),
            switchMap((window: BrowserWindow) => {
                return this.isWindowOpeningValidPage(window, allowedPage, linkToOpen).pipe(
                    map(isValid => {
                        window.webContents.openDevTools();
                        if (isValid) {
                            return window;
                        }
                        this.windowService.closeWindow(window);
                        return null;
                    }),
                );
            }),
            filter<BrowserWindow>(Boolean),
            startWith(originalWindow),
        );
    }

    public async closeTab(tabId: number): Promise<BrowserWindow> {
        if (tabId) {
            return BrowserWindow.fromId(tabId);
        }
    }

    public isUserOnVideoTab(): boolean {
        return this.isUserOnVideoTabVal;
    }

    private isWindowOpeningValidPage(window: BrowserWindow, allowedPage: Website, validLink: string): Observable<boolean> {
        window.hide();
        let listening = true;
        const sub$ = new Subject<boolean>();
        const timeout$ = timer(100).pipe(
            mapTo(false)
        );

        const listener = {...this.requestFilter};
        window.webContents.session.webRequest.onSendHeaders(listener, ({ resourceType, url }: OnSendHeadersListenerDetails): void => {
            if (resourceType !== 'mainFrame' || !listening) {
                return;
            }
            listening = false;
            if(!window.isDestroyed()) {
                window.webContents.session.webRequest.onSendHeaders(listener, null);
            }

            if (!this.isUrlValid(url, allowedPage, validLink)) {
                sub$.next(false);
            } else {
                window.show();
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
