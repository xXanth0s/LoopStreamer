import { inject, injectable } from 'inversify';
import { StoreService } from '../../shared/services/store.service';
import { debounceTime, finalize, first, takeUntil } from 'rxjs/operators';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { ProvidorService } from '../services/providor.service';
import { fromEvent, Observable, Subject } from 'rxjs';
import { WindowController } from './window.controller';
import { setActivePortalTabIdAction, setVidoeTabIdAction } from '../../store/reducers/control-state.reducer';
import { WindowService } from '../services/window.service';
import { app, BrowserWindow, session, webContents } from 'electron';
import { PortalService } from '../services/portalService';
import Website from '../../store/models/website';
import { getActivePortalTabId } from '../../store/selectors/portals.selector';
import OnBeforeSendHeadersListenerDetails = Electron.OnBeforeSendHeadersListenerDetails;

type WebContensCreatedEvent = { event: Event, webContents: webContents };

@injectable()
export class TabController {


    private takeUntilProvidor$ = new Subject();
    private takeUntilPortal$ = new Subject();
    private isUserOnVideoTabVal = false;
    private globalIndex = 0;

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(BACKGROUND_TYPES.ProvidorService) private readonly providorService: ProvidorService,
                @inject(BACKGROUND_TYPES.PortalService) private readonly portalService: PortalService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService,
                @inject(BACKGROUND_TYPES.WindowController) private readonly windowController: WindowController) {
    }

    public startAddBlockerForProvidor(): void {
        this.globalIndex++;

        const index = this.globalIndex;

        this.isUserOnVideoTabVal = true;


        fromEvent<WebContensCreatedEvent>(app, 'web-contents-created').pipe(
            takeUntil(this.store.playerHasStopped()),
            takeUntil(this.takeUntilProvidor$),
        ).subscribe(data => {
            const { webContents } = data;
            const window = BrowserWindow.fromWebContents(webContents);
            if (this.providorService.isUrlValid(webContents.getURL())) {
                fromEvent<Event>(webContents, 'dom-ready').pipe(
                    first()
                ).subscribe(() => {
                    this.store.dispatch(setVidoeTabIdAction(window.id));
                });
            } else {
                // window.close();
            }
        });
        //
        // app.on('br')
        // fromEvent(this.windowService.getVideoWindow().webContents, 'new-window')
        //     .pipe(
        //     takeUntil(this.store.playerHasStopped()),
        //     takeUntil(this.takeUntilProvidor$),
        // ).subscribe((event) => {
        //     const providorTabId = this.store.selectSync(getVideoTabId);
        //     // if (event.tabId === providorTabId) {
        //     //     this.store.stopPlayer();
        //     //     this.windowController.setDefaultState()
        //     // }
        // })
    }

    public getNewWindowsForWebsiteOrLink(allowedPage: Website, linkToOpen: string): Observable<BrowserWindow> {
        const subject$ = new Subject<BrowserWindow>();
        const filter = { urls: [ '*://*/*' ] };
        let oldWindowIds = BrowserWindow.getAllWindows().map(_window => _window.id);
        const sessionInstance = session.fromPartition('persist:');
        sessionInstance.webRequest.onBeforeSendHeaders(filter, (details: OnBeforeSendHeadersListenerDetails, callback): void => {
            if (details.resourceType !== 'mainFrame') {
                callback({ cancel: false });
                return;
            }
            const regex = new RegExp(allowedPage.urlRegex, 'i');
            const isValid = regex.test(details.url) || details.url.includes(linkToOpen);
            if (isValid) {
                const newWindowIds = BrowserWindow.getAllWindows().map(window => window.id);
                const newWindowId = newWindowIds.filter(window => !oldWindowIds.includes(window));
                oldWindowIds = newWindowIds;
                if (newWindowId.length) {

                    const window = BrowserWindow.fromId(newWindowId[0]);
                    // window.webContents.openDevTools();
                    subject$.next(window);
                }
            }

            details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36';
            callback({ cancel: !isValid, requestHeaders: details.requestHeaders });
        });

        // this.windowService.openWindow(linkToOpen)
        this.windowService.openWindow(linkToOpen, { visible: true, nodeIntegration: false });
        return subject$.pipe(
            finalize(() => sessionInstance.webRequest.onBeforeRequest(filter, null))
        );

    }

    public waitTillDomIsReady(windowId: number): Promise<void> {
        return new Promise<void>(resolve => {
            const window = BrowserWindow.fromId(windowId);
            return fromEvent<void>(window, 'dom-ready').pipe(
                debounceTime(1000),
                first(),
            );
        });
    }

    public stopPortalAdBlock(): void {
        this.takeUntilPortal$.next();
    }

    public stopProvidorAdBlock(): void {
        this.takeUntilPortal$.next();
    }

    public async closeTab(tabId: number): Promise<BrowserWindow> {
        if (tabId) {
            return BrowserWindow.fromId(tabId);
        }
    }

    public isUserOnVideoTab(): boolean {
        return this.isUserOnVideoTabVal;
    }

    // private async isPageLoadFinished(tab: Tab, changeInfo: TabChangeInfo): Promise<boolean> {
    //     if (changeInfo.status === 'complete') {
    //         const videoTabId = this.store.selectSync(getVideoTabId);
    //         if (videoTabId && videoTabId !== tab.id) {
    //             await this.closeTab(tab.id);
    //         }
    //         return true;
    //     }
    //
    //     return false;
    // }
    //
    // private isPortalTab(tab: Tabs.Tab): boolean {
    //     const portal = this.store.selectSync(getActivePortal);
    //
    //     const regex = new RegExp(portal?.regex, 'i');
    //     if (regex.test(tab.url)) {
    //         this.store.dispatch(setIsUserOnVideoPageAction(false));
    //         this.store.dispatch(setActivePortalTabIdAction(tab.id));
    //         return true;
    //     }
    //
    //     return false;
    // }

    private isPortalRequestValid(details: Electron.OnBeforeRequestListenerDetails, portal: Website): boolean {
        let isValid = true;
        if (details.resourceType === 'mainFrame') {
            const regex = new RegExp(portal.urlRegex, 'i');
            isValid = regex.test(details.url);
            if (isValid) {
                this.updatePortalTabId(details.webContentsId);
            }
        }
        return isValid;
    }

    private updatePortalTabId(webContentsId: number): void {
        const oldWindowId = this.store.selectSync(getActivePortalTabId);
        const window = BrowserWindow.fromWebContents(webContents.fromId(webContentsId));
        if (window.id !== oldWindowId) {
            this.store.dispatch(setActivePortalTabIdAction(window.id));
            // BrowserWindow.fromId(oldWindowId).close();
        }
    }
}
