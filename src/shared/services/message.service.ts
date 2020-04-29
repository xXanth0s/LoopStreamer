import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../constants/SHARED_TYPES';
import { StoreService } from './store.service';
import { ControllerType } from '../../browserMessages/enum/controller.type';
import { Message } from '../../browserMessages/messages/message.interface';
import { getActivePortalTabId } from '../../store/selectors/portals.selector';
import { getVideoTabId } from '../../store/selectors/control-state.selector';
import { ipcRenderer, ipcMain } from 'electron'
import BrowserWindow = Electron.BrowserWindow;

@injectable()
export class MessageService {

    constructor(@inject(SHARED_TYPES.StoreService) private storeService: StoreService,
                @inject(SHARED_TYPES.ControllerType) private controllerType: ControllerType) {
    }


    public async sendMessageToBackground<T, R>(message: Message<T, R>): Promise<R> {
        return ipcRenderer.invoke(message.type, message.payload);

    }

    public async sendMessageToPortalTab<T, R>(message: Message<T, R>): Promise<R> {
        const portalTabId: number = this.storeService.selectSync(getActivePortalTabId);
        if (portalTabId) {
            return this.sendMessageToBrowserWindow(portalTabId, message);
        }
        return null;
    }

    public async sendMessageToVideoTab<T, R>(message: Message<T, R>): Promise<R | null> {
        const videoTabId: number = this.storeService.selectSync(getVideoTabId);
        if (videoTabId) {
            return this.sendMessageToBrowserWindow(videoTabId, message);
        }
        return null;
    }

    public setControllerType(controllerType: ControllerType): void {
        this.controllerType = controllerType;
        console.info(controllerType)
    }

    private sendMessageToBrowserWindow<T, R>(browserWindowId: number, message: Message<T, R>): Promise<R> {
        const browserWindow = BrowserWindow.fromId(browserWindowId);
        browserWindow.webContents.send(message.type, this.updateMessage(message));
        return this.getReply(message);
    }

    private updateMessage<T>(message: Message<T>): Message<T> {
        return {
            ...message,
            sourceController: this.controllerType
        }
    }

    private getReply<T, R>(message: Message<T, R>): Promise<R> {
        return new Promise<R>(resolve => {
            if (message.hasReply) {
                this.getIpcHandler().once(this.getReplyChannel(message), (event, args) => {
                    resolve(args);
                })
            }
        })

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
