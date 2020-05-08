import { inject, injectable } from 'inversify';
import { StoreService } from '../../shared/services/store.service';
import { first, map, takeUntil } from 'rxjs/operators';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { ProvidorService } from '../services/providor.service';
import { fromEvent, Subject } from 'rxjs';
import { WindowController } from './window.controller';
import {
    setActivePortalTabIdAction,
    setIsUserOnVideoPageAction,
    setVidoeTabIdAction
} from '../../store/reducers/control-state.reducer';
import { getActivePortal } from '../../store/selectors/portals.selector';
import { WindowService } from '../services/window.service';
import { app, BrowserWindow, WebContents } from "electron";
import path from "path";
import { PortalService } from '../services/portalService';

type WebContensCreatedEvent = {event: Event, webContents: WebContents};

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


        // browserRx.tabs.onActivated.pipe(
        //     takeUntil(this.store.playerHasStopped()),
        //     takeUntil(this.takeUntilProvidor$),
        // ).subscribe(async (event) => {
        //     const tab = await browser.tabs.get(event.activeInfo.tabId);
        //     const providorTabId = this.store.selectSync(getVideoTabId);
        //
        //     // @ts-ignore
        //     if (this.providorService.isUrlValid(tab.url || tab.pendingUrl)) {
        //         this.isUserOnVideoTabVal = true;
        //         return
        //     }
        //
        //     if (this.checkIfUserIsOnNewTab(tab)) {
        //         this.isUserOnVideoTabVal = false;
        //         return;
        //     }
        //
        //     if (this.isPortalTab(tab)) {
        //         this.isUserOnVideoTabVal = false;
        //         return;
        //     }
        //
        //     if (tab.openerTabId && tab.openerTabId === providorTabId) {
        //         this.closeTab(tab.id);
        //         this.isUserOnVideoTabVal = true;
        //         return;
        //     }
        //
        //     this.isUserOnVideoTabVal = false;
        // });
        //

        fromEvent<WebContensCreatedEvent>(app, 'web-contents-created').pipe(
            takeUntil(this.store.playerHasStopped()),
            takeUntil(this.takeUntilProvidor$),
        ).subscribe(data => {
            const {webContents} = data;
            const window = BrowserWindow.fromWebContents(webContents)
            if(this.providorService.isUrlValid(webContents.getURL())) {
                fromEvent<Event>(webContents,'dom-ready').pipe(
                    first()
                ).subscribe(() => {
                    this.store.dispatch(setVidoeTabIdAction(window.id));
                })
            } else {
                window.close();
            }
        })
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

    public startAdBlockerForPortal(): void {
        app.on('web-contents-created')
        fromEvent(app, 'web-contents-created').pipe(
            map(data => ({event: data[0], webContents: [1]})),
            takeUntil(this.store.playerHasStopped()),
            takeUntil(this.takeUntilPortal$),
        ).subscribe(data => {
            console.log('startAdBlockerForPortal', data)
            const { webContents } = data
            const window = BrowserWindow.fromWebContents(webContents)
            if(this.portalService.isUrlValid(webContents.getURL())) {
                const window = this.windowService.getPortalWindow();
                window.close();
                this.store.dispatch(setActivePortalTabIdAction(window.id))
            } else {
                window.close();
            }
        })

        // browserRx.tabs.onActivated.pipe(
        //     takeUntil(merge(this.store.playerHasStopped(), this.takeUntilPortal$)),
        // ).subscribe(async (event) => {
        //     const tab = await browser.tabs.get(event.activeInfo.tabId);
        //     if (!this.isPortalTab(tab)) {
        //         this.closeTab(tab.id);
        //     }
        // });
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
        return this.isUserOnVideoTabVal
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
}
