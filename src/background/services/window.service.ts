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
import { DefaultOpenWindowConfig } from '../data/open-window-config-default.data';


export type OpenWindowConfig = {
    nodeIntegration?: boolean;
    visible?: boolean;
    httpReferrer?:  string| Referrer;
    fullscreen?: boolean;

    // load script to website with LoopStreamer functionality,
    // @default: true
    preloadScript?: boolean
}

@injectable()
export class WindowService {

    private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36';

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    public addReduxDevTools(): void {
        BrowserWindow.addDevToolsExtension(
            path.join(__dirname, 'extensions', 'redux-dev-tools', process.env.REDUX_DEV_TOOLS_VERSION)
        )
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
        let finalConfig = {...DefaultOpenWindowConfig, ...config};
        const windowConfig = this.getConfig(finalConfig);
        const window = new BrowserWindow(windowConfig);
        window.loadURL(href, { httpReferrer: finalConfig.httpReferrer });
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

    public closeWindow(browserWindow: BrowserWindow): void {
        if(browserWindow.closable) {
            browserWindow.close()
        }
    }

    private getConfig(config?: Required<OpenWindowConfig>): BrowserWindowConstructorOptions {
        return {
            width: 1800,
            height: 1200,
            fullscreen: config.fullscreen,
            show: config.visible,
            frame: true,
            webPreferences: {
                nodeIntegration: config.nodeIntegration,
                preload: config.preloadScript ? path.resolve(__dirname, 'js', 'content.js') : undefined,
                webSecurity: true,
                allowRunningInsecureContent: true,
                experimentalFeatures: true,
                contextIsolation: !config.nodeIntegration,
                partition: 'persist:',
            },
        }
    }

}
