import { inject, injectable } from 'inversify';
import {
    BeforeSendResponse,
    BrowserWindow,
    BrowserWindowConstructorOptions,
    OnBeforeSendHeadersListenerDetails,
    Referrer,
    Session
} from 'electron';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { getVideoTabId } from '../../store/selectors/control-state.selector';
import { getActivePortalTabId } from '../../store/selectors/portals.selector';
import * as path from 'path';


export type OpenWindowConfig = {
    nodeIntegration?: boolean;
    visible?: boolean;
    httpReferrer?:  string| Referrer;
    fullscreen?: boolean;
}

@injectable()
export class WindowService {

    private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36';

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    private _videoWindow: BrowserWindow;
    private _portalWindow: BrowserWindow;

    public addReduxDevTools(): void {
        // BrowserWindow.addDevToolsExtension(
        //     path.join(os.homedir(), '/AppData/Local/Google/Chrome/User Data/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0')
        // )
    }

    public getPortalWindow(): BrowserWindow {
        const id = this.store.selectSync(getActivePortalTabId);
        if (id) {
            return BrowserWindow.fromId(id);
        }
        return null;
    }

    public getProvidorWindow(): BrowserWindow {
        const id = this.store.selectSync(getVideoTabId);
        if (id) {
            return BrowserWindow.fromId(id);
        }
        return null;
    }

    public setDefaultUserAgent(session: Session): void {
        session.setUserAgent(this.userAgent);
    }

    public openWindow(href: string, config?: OpenWindowConfig): BrowserWindow {
        const windowConfig = this.getConfig(config);
        const window = new BrowserWindow(windowConfig);
        window.loadURL(href, { httpReferrer: config.httpReferrer });
        window.webContents.openDevTools();
        this.setUserAgentForSession(window.webContents.session);
        return window;
    }

    public setUserAgentForSession(newSession: Session): void {
        console.log('setting user agent')
        newSession.webRequest.onBeforeSendHeaders((details: OnBeforeSendHeadersListenerDetails, callback: (beforeSendResponse: BeforeSendResponse) => void) => {
            details.requestHeaders['userAgent'] = this.userAgent;
            callback({cancel: false, requestHeaders: details.requestHeaders});
        })
    }

    private getConfig(config?: OpenWindowConfig): BrowserWindowConstructorOptions {
        return {
            width: 1800,
            height: 1200,
            fullscreen: config?.fullscreen,
            show: config?.visible,
            frame: true,
            webPreferences: {
                nodeIntegration: Boolean(config?.nodeIntegration),
                preload: path.resolve(__dirname, 'js', 'content.js'),
                webSecurity: true,
                allowRunningInsecureContent: true,
                experimentalFeatures: true,
                contextIsolation: !Boolean(config?.nodeIntegration),
                partition: 'persist:',

            },
        }
    }

}
