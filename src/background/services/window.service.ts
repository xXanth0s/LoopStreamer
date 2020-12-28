import { inject, injectable } from 'inversify';
import {
    app,
    BeforeSendResponse,
    BrowserWindow,
    BrowserWindowConstructorOptions,
    OnBeforeSendHeadersListenerDetails,
    session,
    Session,
} from 'electron';
import * as path from 'path';
import { ElectronBlocker } from '@cliqz/adblocker-electron';
import fetch from 'cross-fetch';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, first, takeUntil } from 'rxjs/operators';
import { Windows } from 'webextension-polyfill-ts';
import { getWindowStateForWindowId, getWindowStateForWindowType } from '../../store/selectors/control-state.selector';
import { setWindowSizeAction, setWindowStateAction } from '../../store/reducers/control-state.reducer';
import { DefaultOpenWindowConfig } from '../data/open-window-config-default.data';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { WindowType } from '../../store/enums/window-type.enum';
import { Logger } from '../../shared/services/logger';
import { environment } from '../../environments/environment';
import { OpenWindowConfig } from '../data/types/open-window-config.type';
import { DEFAULT_SESSION_NAME, DEFAULT_TITLE } from '../../constants/electron-variables';
import WindowState = Windows.WindowState;

@injectable()
export class WindowService {
    private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36';

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    public addReduxDevTools(): void {
        // BrowserWindow.addDevToolsExtension(
        //     path.join(__dirname, 'extensions', 'redux-dev-tools', environment.reduxDevToolsVersion),
        // );
    }

    public openWindow(href: string, config?: OpenWindowConfig): BrowserWindow {
        try {
            const finalConfig: Required<OpenWindowConfig> = { ...DefaultOpenWindowConfig, ...config };
            const windowConfig = this.getConfig(finalConfig);
            const window = new BrowserWindow(windowConfig);
            window.loadURL(href);
            this.addDefaultHandlingForNewWindow(window, finalConfig.mutePage);
            if (finalConfig.manipulateSession) {
                this.addDefaultHandlingForSession(window.webContents.session);
            }

            return window;
        } catch (e) {
            Logger.error('[WindowService->openWindow]', e);
            throw (e);
        }
    }

    public closeWindow(windowId?: number, closeParentWindows = false): void {
        if (!windowId) {
            return;
        }

        const appWindowState = this.store.selectSync(getWindowStateForWindowType, WindowType.APP);
        const browserWindow = BrowserWindow.fromId(windowId);
        if (!browserWindow?.closable) {
            return;
        }

        const parentWindowId = browserWindow.getParentWindow()?.id;
        const isParentAppWindow = !parentWindowId || parentWindowId === appWindowState.windowId;

        if (!closeParentWindows || (closeParentWindows && isParentAppWindow)) {
            browserWindow.close();
            return;
        }

        if (closeParentWindows && !isParentAppWindow) {
            this.closeWindow(parentWindowId, closeParentWindows);
        }

        if (windowId === 1) {
            app.quit();
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

    public addDefaultHandlingForNewWindow(window: BrowserWindow, mutePage = true): void {
        window.removeMenu();
        window.webContents.setAudioMuted(mutePage);
        this.hideNewWindows(window);
        this.stopPlayerWhenActiveWindowClosed(window);
        this.listenToWindowSizeChanges(window);
    }

    private addDefaultHandlingForSession(session: Session): void {
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
            options.show = environment.showNewWindows;
        });

        if (environment.openDevTools) {
            window.webContents.openDevTools();
        }
    }

    private stopPlayerWhenActiveWindowClosed(window: BrowserWindow): void {
        fromEvent(window, 'close').pipe(
            first(),
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
            if (details.requestHeaders.Referer?.includes('localhost')) {
                const { host } = new URL(details.url);

                // adding host as referer, to bypass ddos protection
                details.requestHeaders.Referer = host;
            }

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
            debounceTime(500)
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
            width: config.width,
            height: config.height,
            fullscreen: config.fullscreen,
            title: DEFAULT_TITLE,
            show: config.visible,
            frame: false,
            icon: path.resolve(__dirname, 'assets', 'logo.ico'),
            fullscreenable: true,
            resizable: config.resizable,
            webPreferences: {
                enableRemoteModule: true,
                session: session.defaultSession,
                nodeIntegration: config.nodeIntegration,
                preload: config.preloadScript ? path.resolve(__dirname, 'preload.js') : undefined,
                webSecurity: true,
                allowRunningInsecureContent: true,
                experimentalFeatures: true,
                contextIsolation: !config.nodeIntegration,
                partition: DEFAULT_SESSION_NAME,
            },
        };
    }
}
