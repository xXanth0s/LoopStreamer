import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { getVideoWindowId } from '../../store/selectors/control-state.selector';
import { setCurrentWindowStateAction } from '../../store/reducers/control-state.reducer';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { ProvidorService } from '../services/providor.service';
import { PortalService } from '../services/portalService';
import { WindowService } from '../services/window.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import Website from '../../store/models/website';
import { BrowserWindow, OnBeforeSendHeadersListenerDetails } from 'electron';

@injectable()
export class WindowController {

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
            // await chromme.windows.update(windowId, {state: 'fullscreen'});
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
        const window = this.windowService.openWindow(linkToOpen, { visible: true, nodeIntegration: false });
        const subject$ = new BehaviorSubject<BrowserWindow>(window);
        this.startAdblockForWindowSession(window, allowedPage, linkToOpen, subject$);

        // this.windowService.openWindow(linkToOpen)
        return subject$;

    }



    private startAdblockForWindowSession(window: BrowserWindow, allowedPage: Website, linkToOpen: string, subject$: Subject<BrowserWindow>): void {
        const filter = { urls: [ '*://*/*' ] };
        let oldWindowIds = BrowserWindow.getAllWindows().map(_window => _window.id);
        window.webContents.session.webRequest.onBeforeSendHeaders(filter, (details: OnBeforeSendHeadersListenerDetails, callback): void => {
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
                    const newWindow = BrowserWindow.fromId(newWindowId[0]);
                    newWindow.webContents.openDevTools();
                    this.startAdblockForWindowSession(newWindow, allowedPage, linkToOpen, subject$);
                    this.windowService.setUserAgentForSession(newWindow.webContents.session);
                    // window.close();
                    subject$.next(newWindow);
                }
            } else {
                console.log('canceling page', details)
            }

            callback({ cancel: !isValid, requestHeaders: details.requestHeaders });
        });
    }

    public async closeTab(tabId: number): Promise<BrowserWindow> {
        if (tabId) {
            return BrowserWindow.fromId(tabId);
        }
    }

    public isUserOnVideoTab(): boolean {
        return this.isUserOnVideoTabVal;
    }

}
