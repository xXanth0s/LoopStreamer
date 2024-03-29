import { inject, injectable } from 'inversify';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import { fromEvent } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { autoUpdater } from 'electron-updater';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import { ExecuteScriptMessage, RecaptchaRecognizedMessage } from '../../browserMessages/messages/background.messages';
import { setWindowIdForWindowTypeAction } from '../../store/reducers/control-state.reducer';
import { WindowService } from '../services/window.service';
import { WindowType } from '../../store/enums/window-type.enum';
import { environment } from '../../environments/environment';
import { OpenWindowConfig } from '../data/types/open-window-config.type';
import { DefaultOpenWindowConfig } from '../data/open-window-config-default.data';
import { VIDEO_IN_VIDEO_CSS_CLASS } from '../../content/constants/class-names';
import { appStartedAction } from '../../store/actions/shared.actions';

@injectable()
export class RootBackgroundController {
    private readonly appWindowConfig: OpenWindowConfig = {
        mutePage: false,
        nodeIntegration: true,
        visible: true,
        preloadScript: false,
        manipulateSession: true,
        width: DefaultOpenWindowConfig.width,
        height: DefaultOpenWindowConfig.height,
    };

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService) {
    }

    public openApp(): void {
        let href: string;
        const { isDev, openAppDevTools } = environment;
        if (isDev) {
            href = process.env.WEBPACK_DEV_SERVER_URL as string;
        } else {
            createProtocol('app');
            href = 'app://./index.html';
        }

        const window = this.windowService.openWindow(href, this.appWindowConfig);

        this.store.dispatch(setWindowIdForWindowTypeAction({
            windowId: window.id,
            windowType: WindowType.APP,
        }));

        if (openAppDevTools) {
            window.webContents.openDevTools();
        }
        if (!isDev) {
            autoUpdater.checkForUpdatesAndNotify();
        }
        this.store.dispatch(appStartedAction());
    }

    public initializeHandler(): void {
        ipcMain.handle(
            MessageType.BACKGROUND_RECAPTCHA_RECOGNIZED,
            (event, message: RecaptchaRecognizedMessage,
            ): void => {
                this.recaptchaRecognizedHandler(event, message);
            });

        ipcMain.handle(MessageType.BACKGROUND_CLOSE_WINDOW, (event): void => {
            this.closeWindowEventHandler(event);
        });

        ipcMain.handle(MessageType.BACKGROUND_TOGGLE_WINDOW_FULLSCREEN, (event): void => {
            this.toggleWindowFullscreenEventHandler(event);
        });

        ipcMain.handle(MessageType.BACKGROUND_TOGGLE_WINDOW_MAXIMIZATION, (event): void => {
            this.toggleWindowMaximizationEventHandler(event);
        });

        ipcMain.handle(MessageType.BACKGROUND_MINIMIZE_WINDOW, (event): void => {
            this.minimizeWindowEventHandler(event);
        });

        ipcMain.handle(MessageType.BACKGROUND_START_VIDEO_IN_VIDEO, (event): void => {
            this.startVideoInVideo(event);
        });

        ipcMain.handle(MessageType.BACKGROUND_EXECUTE_SCRIPT, (event, message: ExecuteScriptMessage): void => {
            this.executeScriptEventHandler(event, message);
        });
    }

    private recaptchaRecognizedHandler(event: IpcMainInvokeEvent, message: RecaptchaRecognizedMessage): void {
        const window = BrowserWindow.fromWebContents(event.sender);
        const { width, height } = message.payload;
        if (width < 100 || height < 100) {
            return;
        }

        const oldWindowWidth = window.getSize()[0];
        const oldWindowHeight = window.getSize()[1];
        this.windowService.setWindowSizeForRecaptcha(window.id, width, height);
        window.webContents.closeDevTools();
        window.show();

        const takeUntil$ = fromEvent(window, 'closed').pipe(
            first(),
        );

        fromEvent(window.webContents, 'will-navigate').pipe(
            takeUntil(takeUntil$),
        ).subscribe(() => {
            this.windowService.setWindowSizeForRecaptcha(window.id, oldWindowWidth, oldWindowHeight);
            window.hide();
        });
    }

    private closeWindowEventHandler(event: IpcMainInvokeEvent): void {
        const window = BrowserWindow.fromWebContents(event.sender);
        this.windowService.closeWindow(window.id, true);
    }

    private toggleWindowMaximizationEventHandler(event: IpcMainInvokeEvent): void {
        const window = BrowserWindow.fromWebContents(event.sender);
        this.windowService.toggleMaximization(window.id);
    }

    private toggleWindowFullscreenEventHandler(event: IpcMainInvokeEvent): void {
        const window = BrowserWindow.fromWebContents(event.sender);
        this.windowService.toggleFullscreen(window.id);
    }

    private minimizeWindowEventHandler(event: IpcMainInvokeEvent): void {
        const window = BrowserWindow.fromWebContents(event.sender);
        this.windowService.minimizeWindow(window.id);
    }

    private startVideoInVideo(event: Electron.IpcMainInvokeEvent): void {
        const window = BrowserWindow.fromWebContents(event.sender);
        const jsCode = `document.querySelector('.${VIDEO_IN_VIDEO_CSS_CLASS}').requestPictureInPicture()`;
        window.webContents.executeJavaScript(jsCode, true);
    }

    private executeScriptEventHandler(event: Electron.IpcMainInvokeEvent, message: ExecuteScriptMessage): void {
        const window = BrowserWindow.fromWebContents(event.sender);
        const code = { code: message.payload.script };
        window.webContents.executeJavaScriptInIsolatedWorld(999, [ code ], true);
    }
}
