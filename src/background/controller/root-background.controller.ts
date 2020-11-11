import { inject, injectable } from 'inversify';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { PortalController } from './portal.controller';
import { VideoController } from './video.controller';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import {
    CloseWindowMessage,
    MinimizeWindowMessage,
    RecaptchaRecognizedMessage,
    ToggleWindowFullscreenMessage,
    ToggleWindowMaximizationMessage
} from '../../browserMessages/messages/background.messages';
import { setWindowIdForWindowTypeAction } from '../../store/reducers/control-state.reducer';
import { WindowService } from '../services/window.service';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import { WindowType } from '../../store/enums/window-type.enum';
import { environment } from '../../environments/environment';
import { OpenWindowConfig } from '../data/types/open-window-config.type';
import { DefaultOpenWindowConfig } from '../data/open-window-config-default.data';
import { APP_HEIGHT, APP_WIDTH } from '../../constants/electron-variables';
import { VIDEO_IN_VIDEO_CSS_CLASS } from '../../content/constants/class-names';

@injectable()
export class RootBackgroundController {

    private readonly appWindowConfig: OpenWindowConfig = {
        nodeIntegration: true,
        visible: true,
        preloadScript: false,
        manipulateSession: true,
        width: environment.openAppDevTools ? DefaultOpenWindowConfig.width : APP_WIDTH,
        height: environment.openAppDevTools ? DefaultOpenWindowConfig.height : APP_HEIGHT,
    };

    constructor(@inject(BACKGROUND_TYPES.PortalController) private readonly portalController: PortalController,
                @inject(BACKGROUND_TYPES.VideoController) private readonly videoController: VideoController,
                @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService) {
    }

    public openApp(): void {
        let href: string;
        const {isDev, openAppDevTools} = environment;
        if (isDev) {
            href = process.env.WEBPACK_DEV_SERVER_URL as string;
        } else {
            createProtocol('app');
            href = 'app://./index.html';
        }

        const window = this.windowService.openWindow(href, this.appWindowConfig);

        this.store.dispatch(setWindowIdForWindowTypeAction({
            windowId: window.id,
            windowType: WindowType.APP
        }));

        if (openAppDevTools) {
            window.webContents.openDevTools();
            this.windowService.addReduxDevTools();
        }
    }

    public initializeHandler(): void {
        ipcMain.handle(MessageType.BACKGROUND_RECAPTCHA_RECOGNIZED,
            (event, message: RecaptchaRecognizedMessage): void => {
                this.recaptchaRecognizedHandler(event, message);
            });

        ipcMain.handle(MessageType.BACKGROUND_CLOSE_WINDOW,
            (event, message: CloseWindowMessage): void => {
                this.closeWindowEventHandler(event, message);
            });

        ipcMain.handle(MessageType.BACKGROUND_TOGGLE_WINDOW_FULLSCREEN,
            (event, message: ToggleWindowFullscreenMessage): void => {
                this.toggleWindowFullscreenEventHandler(event, message);
            });

        ipcMain.handle(MessageType.BACKGROUND_TOGGLE_WINDOW_MAXIMIZATION,
            (event, message: ToggleWindowMaximizationMessage): void => {
                this.toggleWindowMaximizationEventHandler(event, message);
            });

        ipcMain.handle(MessageType.BACKGROUND_MINIMIZE_WINDOW,
            (event, message: MinimizeWindowMessage): void => {
                this.minimizeWindowEventHandler(event, message);
            });

        ipcMain.handle(MessageType.BACKGROUND_START_VIDEO_IN_VIDEO,
            (event): void => {
                this.startVideoInVideo(event);
            });
    }

    private recaptchaRecognizedHandler(event: IpcMainInvokeEvent, message: RecaptchaRecognizedMessage): void {
        const window = BrowserWindow.fromWebContents(event.sender);
        const { width, height } = message.payload;
        window.setSize(width, height);
        window.webContents.closeDevTools();
        window.show();
    }

    private closeWindowEventHandler(event: IpcMainInvokeEvent, message: CloseWindowMessage): void {
        const windowId = message.payload;
        this.windowService.closeWindow(windowId, true);
    }

    private toggleWindowMaximizationEventHandler(event: IpcMainInvokeEvent, message: ToggleWindowMaximizationMessage): void {
        const windowId = message.payload;
        this.windowService.toggleMaximization(windowId);
    }

    private toggleWindowFullscreenEventHandler(event: IpcMainInvokeEvent, message: ToggleWindowFullscreenMessage): void {
        const windowId = message.payload;
        this.windowService.toggleFullscreen(windowId);
    }

    private minimizeWindowEventHandler(event: IpcMainInvokeEvent, message: MinimizeWindowMessage): void {
        const windowId = message.payload;
        this.windowService.minimizeWindow(windowId);
    }

    private startVideoInVideo(event: Electron.IpcMainInvokeEvent): void {
        const window = BrowserWindow.fromWebContents(event.sender);
        window.webContents.executeJavaScript(`document.querySelector('.${VIDEO_IN_VIDEO_CSS_CLASS}').requestPictureInPicture()`, true);
    }
}
