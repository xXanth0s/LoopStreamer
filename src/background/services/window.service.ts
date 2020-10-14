import { inject, injectable } from 'inversify';
import {
    BeforeSendResponse,
    BrowserWindow,
    BrowserWindowConstructorOptions,
    OnBeforeSendHeadersListenerDetails,
    Referrer,
    session,
    Session
} from 'electron';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import * as path from 'path';
import { DefaultOpenWindowConfig } from '../data/open-window-config-default.data';
import { ElectronBlocker } from '@cliqz/adblocker-electron';
import fetch from 'cross-fetch';


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

    public openWindow(href: string, config?: OpenWindowConfig): BrowserWindow {
        let finalConfig = {...DefaultOpenWindowConfig, ...config};
        const windowConfig = this.getConfig(finalConfig);
        const window = new BrowserWindow(windowConfig);
        window.loadURL(href, { httpReferrer: finalConfig.httpReferrer });
        this.addDefaultHandlingForNewWindow(window);
        this.addAdblockerForSession(window.webContents.session);
        return window;
    }

    public closeWindow(browserWindow: BrowserWindow): void {
        if(browserWindow?.closable) {
            browserWindow.close()
        }
    }

    public addDefaultHandlingForNewWindow(window: BrowserWindow): void {
        const session = window.webContents.session;
        this.hideNewWindows(window);
        this.manipulateSession(session);
        this.addAdblockerForSession(session);
    }

    private hideNewWindows(window: BrowserWindow): void {
        window.webContents.on("new-window", (e, url, frameName, disposition, options) => {
            options.show = Boolean(+process.env.SHOW_NEW_WINDOWS)
        })

        if(Boolean(+process.env.OPEN_DEV_TOOLS)) {
            window.webContents.openDevTools()
        }
    }

    private addAdblockerForSession(session: Session): void {
        ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
            blocker.enableBlockingInSession(session);
        });
    }

    private manipulateSession(newSession: Session): void {
        newSession.webRequest.onBeforeSendHeaders((details: OnBeforeSendHeadersListenerDetails, callback: (beforeSendResponse: BeforeSendResponse) => void) => {
            const {host} = new URL(details.url);

            details.requestHeaders['Referer'] = host;
            details.requestHeaders['User-Agent'] = this.userAgent;

            callback({cancel: false, requestHeaders: details.requestHeaders});
        })
    }

    private getConfig(config?: Required<OpenWindowConfig>): BrowserWindowConstructorOptions {
        return {
            width: 1800,
            height: 1200,
            fullscreen: config.fullscreen,
            show: config.visible,
            frame: true,
            fullscreenable: false,
            webPreferences: {
                session: session.defaultSession,
                nodeIntegration: config.nodeIntegration,
                preload: config.preloadScript ? path.resolve(__dirname, 'content.js') : undefined,
                webSecurity: true,
                allowRunningInsecureContent: true,
                experimentalFeatures: true,
                contextIsolation: !config.nodeIntegration,
                partition: 'persist:',
            },
        }
    }
}
