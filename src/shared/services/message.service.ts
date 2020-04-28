import {inject, injectable} from 'inversify';
import {SHARED_TYPES} from '../constants/SHARED_TYPES';
import {StoreService} from './store.service';
import { ControllerType } from '../../browserMessages/enum/controller.type';
import { Message } from '../../browserMessages/messages/message.interface';
import { getActivePortalTabId } from '../../store/selectors/portals.selector';
import { getVideoTabId } from '../../store/selectors/control-state.selector';
import ipcRenderer = Electron.ipcRenderer;

@injectable()
export class MessageService {

    constructor(@inject(SHARED_TYPES.StoreService) private storeService: StoreService,
                @inject(SHARED_TYPES.ControllerType) private controllerType: ControllerType) {
    }


    public async sendMessageToBackground<T, R>(message: Message<T>): Promise<R | null> {
        return ipcRenderer.invoke(message.type, message.payload)
        // return browser.runtime.sendMessage(this.updateMessage(message));
    }

    public async sendMessageToPortalTab<T>(message: Message<any>): Promise<T | null>  {
        const portalTabId: number = this.storeService.selectSync(getActivePortalTabId);
        if (portalTabId) {
            // return browser.tabs.sendMessage(portalTabId, this.updateMessage(message));
        }
        return null;
    }

    public async sendMessageToVideoTab<T, R>(message: Message<T>): Promise<R | null> {
        const videoTabId: number = this.storeService.selectSync(getVideoTabId);
        if (videoTabId) {
            try {
                // return await browser.tabs.sendMessage(videoTabId, this.updateMessage(message));

            } catch (e) {
                console.error(e)
            }
        }
        return null;
    }

    public async sendMessageToActiveTab<T, R>(message: Message<T>): Promise<R | null> {
        // const tabs = await browser.tabs.query({active: true, currentWindow: true});
        // if (tabs.length) {
        //     try {
                // return await browser.tabs.sendMessage(tabs[0].id, this.updateMessage(message));
            //
            // } catch (e) {
            //     console.error(e)
            // }
        // }
        return null;
    }

    public setControllerType(controllerType: ControllerType): void {
        this.controllerType = controllerType;
        console.info(controllerType)
    }

    private updateMessage<T>(message: Message<T>): Message<T> {
        return {
            ...message,
            sourceController: this.controllerType
        }
    }
}
