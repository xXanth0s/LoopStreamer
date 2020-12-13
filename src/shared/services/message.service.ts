import { inject, injectable } from 'inversify';
import { BrowserWindow, ipcMain, ipcRenderer, IpcRenderer, WebContents, } from 'electron';
import { SHARED_TYPES } from '../constants/SHARED_TYPES';
import { StoreService } from './store.service';
import { ControllerType } from '../../browserMessages/enum/controller.type';
import { Message } from '../../browserMessages/messages/message.interface';
import { getWindowIdForWindowType } from '../../store/selectors/control-state.selector';
import { WindowType } from '../../store/enums/window-type.enum';
import { Logger } from './logger';

@injectable()
export class MessageService {
    constructor(@inject(SHARED_TYPES.StoreService) private storeService: StoreService,
                @inject(SHARED_TYPES.ControllerType) private controllerType: ControllerType) {
    }

    public async sendMessageToBackground<T, R>(message: Message<T, R>): Promise<R> {
        Logger.info('[MessageService->sendMessageToBackground] sending message to Background:', message);
        return ipcRenderer.invoke(message.type, message);
    }

    public async sendMessageToVideoWindow<T, R>(message: Message<T, R>): Promise<R | null> {
        const videoTabId: number = this.storeService.selectSync(getWindowIdForWindowType, WindowType.VIDEO);
        if (videoTabId) {
            return this.sendMessageToBrowserWindow(videoTabId, message);
        }
        return null;
    }

    public setControllerType(controllerType: ControllerType): void {
        this.controllerType = controllerType;
        console.info(controllerType);
    }

    public replyToSender<T, R>(message: Message<T, R>, sender: WebContents | IpcRenderer, args: R): void {
        sender.send(this.getReplyChannel(message), args);
    }

    public sendMessageToBrowserWindow<T, R>(browserWindowId: number, message: Message<T, R>): Promise<R> {
        console.log('sending message to window, ', browserWindowId);
        console.log(message);
        const browserWindow = BrowserWindow.fromId(browserWindowId);
        browserWindow.webContents.send(message.type, this.updateMessage(message));
        return this.getReply(message);
    }

    private updateMessage<T>(message: Message<T>): Message<T> {
        return {
            ...message,
            sourceController: this.controllerType,
        };
    }

    private getReply<T, R>(message: Message<T, R>): Promise<R> {
        return new Promise<R>(resolve => {
            if (message.hasReply) {
                this.getIpcHandler().once(this.getReplyChannel(message), (event, args) => {
                    resolve(args);
                });
            }
        });
    }

    private getReplyChannel<T, R>(message: Message<T, R>): string {
        return `${message.type}_reply`;
    }

    private getIpcHandler(): NodeJS.EventEmitter {
        if (this.controllerType === ControllerType.BACKGROUND) {
            return ipcMain;
        }

        return ipcRenderer;
    }
}
