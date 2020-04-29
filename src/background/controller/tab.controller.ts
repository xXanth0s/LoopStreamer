import {inject, injectable} from 'inversify';
import {StoreService} from '../../shared/services/store.service';
import {browser, Tabs} from 'webextension-polyfill-ts';
import { filter, first, switchMap, takeUntil } from 'rxjs/operators';
import {SHARED_TYPES} from '../../shared/constants/SHARED_TYPES';
import {BACKGROUND_TYPES} from '../container/BACKGROUND_TYPES';
import {ProvidorService} from '../services/providor.service';
import { from, fromEvent, merge, Subject } from 'rxjs';
import {WindowController} from './window.controller';
import { getVideoTabId } from '../../store/selectors/control-state.selector';
import { setVidoeTabIdAction, setVideoWindowIdAction, setIsUserOnVideoPageAction, setActivePortalTabIdAction } from 'src/store/reducers/control-state.reducer';
import { getActivePortal } from '../../store/selectors/portals.selector';
import Tab = Tabs.Tab;
import { WindowService } from '../services/window.service';
import BrowserView = Electron.BrowserView;
import { app } from "electron";
import BrowserWindow = Electron.BrowserWindow;

type WindowCreatedEvent = {event: Event, browserWindow: BrowserWindow};

@injectable()
export class TabController {


    private takeUntilProvidor$ = new Subject();
    private takeUntilPortal$ = new Subject();
    private isUserOnVideoTabVal = false;
    private globalIndex = 0;

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(BACKGROUND_TYPES.ProvidorService) private readonly providorService: ProvidorService,
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

        fromEvent<WindowCreatedEvent>(app, 'browser-window-created').pipe(
            takeUntil(this.store.playerHasStopped()),
            takeUntil(this.takeUntilProvidor$),
        ).subscribe(data => {
            const {webContents} = data.browserWindow;
            if(this.providorService.isUrlValid(webContents.getURL())) {
                fromEvent<Event>(webContents,'dom-ready').pipe(
                    first()
                ).subscribe(() => {
                    this.store.dispatch(setVidoeTabIdAction(data.browserWindow.id));
                })
            } else {
                data.browserWindow.close();
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

    public async closeTab(tabId: number): Promise<void> {
        if (tabId) {
            return browser.tabs.remove(tabId);
        }
    }

    public async openTab(href: string): Promise<Tabs.Tab> {
        return browser.tabs.create({active: true, url: href});
    }

    public async setActive(tabId: number): Promise<void> {
        await browser.tabs.update(tabId, {active: true});
    }

    public isUserOnVideoTab(): boolean {
        return this.isUserOnVideoTabVal
    }

    private checkIfUserIsOnNewTab(tab: Tabs.Tab): boolean {
        // @ts-ignore
        const url = tab.url || tab.pendingUrl;
        return url === 'chrome://newtab/';
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

    private isPortalTab(tab: Tabs.Tab): boolean {
        const portal = this.store.selectSync(getActivePortal);

        const regex = new RegExp(portal?.regex, 'i');
        if (regex.test(tab.url)) {
            this.store.dispatch(setIsUserOnVideoPageAction(false));
            this.store.dispatch(setActivePortalTabIdAction(tab.id));
            return true;
        }

        return false;
    }
}
