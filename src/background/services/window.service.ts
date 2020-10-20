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
import { fromEvent, merge } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { getWindowStateForWindowId, getWindowStateForWindowType } from '../../store/selectors/control-state.selector';
import { setWindowSizeAction, setWindowStateAction } from '../../store/reducers/control-state.reducer';
import { Windows } from 'webextension-polyfill-ts';
import { WindowType } from '../../store/enums/window-type.enum';
import WindowState = Windows.WindowState;


export type OpenWindowConfig = {
    nodeIntegration?: boolean;
    visible?: boolean;
    httpReferrer?: string | Referrer;
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
        // BrowserWindow.addDevToolsExtension(
        //     path.join(__dirname, 'extensions', 'redux-dev-tools', process.env.REDUX_DEV_TOOLS_VERSION)
        // );
    }

    public openWindow(href: string, config?: OpenWindowConfig): BrowserWindow {
        let finalConfig = { ...DefaultOpenWindowConfig, ...config };
        const windowConfig = this.getConfig(finalConfig);
        const window = new BrowserWindow(windowConfig);
        window.loadURL(href, { httpReferrer: finalConfig.httpReferrer });
        this.addDefaultHandlingForNewWindow(window);
        this.addAdblockerForSession(window.webContents.session);
        return window;
    }

    public closeWindow(windowId?: number): void {
        if (!windowId) {
            return;
        }

        const browserWindow = BrowserWindow.fromId(windowId);
        if (browserWindow?.closable) {
            browserWindow.close();
        }
    }

    public minimizeWindow(windowId: number): void {
        const browserWindow = BrowserWindow.fromId(windowId);
        if (browserWindow?.minimizable) {
            browserWindow.minimize();
        }
    }

    public toggleMaximization(windowId: number): void {
        const browserWindow = BrowserWindow.fromId(windowId);
        if (browserWindow?.isMaximized()) {
            browserWindow.unmaximize();
        } else if (browserWindow?.maximizable) {
            browserWindow.maximize();
        }
    }

    public toggleFullscreen(windowId: number): void {
        const browserWindow = BrowserWindow.fromId(windowId);
        if (browserWindow?.isFullScreen()) {
            browserWindow.setFullScreen(false);
        } else if (browserWindow?.isFullScreenable()) {
            browserWindow.setFullScreen(true);
        }

    }

    public addDefaultHandlingForNewWindow(window: BrowserWindow): void {
        const session = window.webContents.session;
        window.removeMenu();

        this.hideNewWindows(window);
        this.stopPlayerWhenActiveWindowClosed(window);
        this.listenToWindowSizeChanges(window);

        this.manipulateSession(session);
        this.addAdblockerForSession(session);
    }

    public setOldWindowState(windowId: number, windowType: WindowType): void {
        const windowState = this.store.selectSync(getWindowStateForWindowType, windowType);
        const window = BrowserWindow.fromId(windowId);
        if (!(windowState && window)) {
            return;
        }

        if (windowState.width && windowState.height) {
            window.setSize(windowState.width, windowState.height);
        }
        if (windowState.windowState === 'fullscreen') {
            window.setFullScreen(true);
        } else if (windowState.windowState === 'maximized') {
            window.maximize();
        }
    }

    private addAdblockerForSession(session: Session): void {
        ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
            blocker.enableBlockingInSession(session);
        });
    }

    private hideNewWindows(window: BrowserWindow): void {
        window.webContents.on('new-window', (e, url, frameName, disposition, options) => {
            options.show = Boolean(+process.env.SHOW_NEW_WINDOWS);
        });

        if (Boolean(+process.env.OPEN_DEV_TOOLS)) {
            window.webContents.openDevTools();
        }
    }

    private stopPlayerWhenActiveWindowClosed(window: BrowserWindow): void {
        fromEvent(window, 'close').pipe(
            first()
        ).subscribe(() => {
            const windowState = this.store.selectSync(getWindowStateForWindowId, window.id);
            if (windowState) {
                this.store.stopPlayer();
                this.store.resetControlState();
            }
        });
    }

    private manipulateSession(newSession: Session): void {
        newSession.webRequest.onBeforeSendHeaders((details: OnBeforeSendHeadersListenerDetails, callback: (beforeSendResponse: BeforeSendResponse) => void) => {
            const { host } = new URL(details.url);

            // adding host as referer, to bypass ddos protection
            details.requestHeaders['Referer'] = host;

            // set user agent for recaptcha
            details.requestHeaders['User-Agent'] = this.userAgent;

            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });
    }

    private listenToWindowSizeChanges(window: BrowserWindow): void {
        merge(
            fromEvent(window, 'resize'),
            fromEvent(window, 'enter-fullscreen'),
            fromEvent(window, 'leave-fullscreen'),
            fromEvent(window, 'maximize'),
            fromEvent(window, 'unmaximize'),
            fromEvent(window, 'minimize'),
            fromEvent(window, 'restore'),
        ).pipe(
            takeUntil(fromEvent(window, 'closed')),
        ).subscribe(() => {
            let state: WindowState = 'normal';
            if (window.isFullScreen()) {
                state = 'fullscreen';
            } else if (window.isMaximized()) {
                state = 'maximized';
            } else if (window.isMinimized()) {
                state = 'minimized';
            } else {
                const size = window.getSize();
                this.store.dispatch(setWindowSizeAction({
                    windowId: window.id,
                    width: size[0],
                    height: size[1],
                }));
            }

            this.store.dispatch(setWindowStateAction({
                windowId: window.id,
                windowState: state,
            }));
        });
    }

    private getConfig(config: Required<OpenWindowConfig>): BrowserWindowConstructorOptions {
        return {
            width: 1600,
            height: 900,
            fullscreen: config.fullscreen,
            show: config.visible,
            frame: false,
            icon: path.resolve(__dirname, 'assets', 'logo.ico'),
            fullscreenable: true,
            webPreferences: {
                enableRemoteModule: true,
                session: session.defaultSession,
                // nodeIntegration: config.nodeIntegration,
                nodeIntegration: true,
                preload: config.preloadScript ? path.resolve(__dirname, 'preload.js') : undefined,
                webSecurity: true,
                allowRunningInsecureContent: true,
                experimentalFeatures: true,
                contextIsolation: !config.nodeIntegration,
                partition: 'persist:',
            },
        };
    }
}
