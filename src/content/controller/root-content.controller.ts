import {inject, injectable} from 'inversify';
import {CONTENT_TYPES} from '../container/CONTENT_TYPES';
import {PortalService} from '../services/portal.service';
import {ProvidorService} from '../services/providor.service';
import {SHARED_TYPES} from '../../shared/constants/SHARED_TYPES';
import {MessageService} from '../../shared/services/message.service';
import { Message } from '../../browserMessages/messages/message.interface';
import { ControllerType } from '../../browserMessages/enum/controller.type';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import { GetActiveVideoInformation } from '../../browserMessages/messages/portal.messages';
import { StartVideoProvidorMessage } from '../../browserMessages/messages/providor.messages';
import Series from '../../store/models/series.model';
import {ipcRenderer} from 'electron' ;

@injectable()
export class RootContentController {

    constructor(@inject(CONTENT_TYPES.PortalService) private readonly portalService: PortalService,
                @inject(CONTENT_TYPES.ProvidorService) private readonly providorService: ProvidorService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService) {
    }

    public init(): void {

        ipcRenderer.on(MessageType.PORTAL_GET_VIDEO_INFORMATION, (event, args: GetActiveVideoInformation) => {
            event.returnValue
            // this.getInformationForOpenVideo(args.payload, event.sender.);
        })
        // @ts-ignore
        browser.runtime.onMessage.addListener((request, sender, sendResponse) => this.handleOnMessageRequest(request, sendResponse));
    }

    private handleOnMessageRequest(message: Message<any>, cb: (data: any) => void): boolean {
        if (message.destinationController === ControllerType.PORTAL || message.destinationController === ControllerType.PROVIDOR) {
            switch (message.type) {
                case MessageType.PORTAL_GET_VIDEO_INFORMATION: {
                    const {payload} = message as GetActiveVideoInformation;
                    this.getInformationForOpenVideo(payload, cb);
                    return true;
                }
                case MessageType.PORTAL_NEXT_EPISODE_LINK: {
                    this.getLinkForNextVideo(cb);
                    return true;
                }
                case MessageType.PORTAL_PREVIOUS_EPISODE_LINK: {
                    this.getLinkForPreviousVideo(cb);
                    return true;
                }
                case MessageType.PROVIDOR_START_VIDEO: {
                    this.startVideoFromProvidor(message as StartVideoProvidorMessage);
                    break;
                }
            }
        }
        return false;

    }

    private async getInformationForOpenVideo(withVideoLink: boolean, cb: (episodeInfo: Series) => void): Promise<void> {
        const providor = this.portalService.getPortalController().isVideoOpenWithProvidor();
        if (providor) {
            this.providorService.setActiveProvidor(providor);
            const seriesInfo = await this.portalService.getPortalController().getSeriesInfo(withVideoLink);
            cb(seriesInfo);
        } else {
            cb(null)
        }
    }

    private async startVideoFromProvidor({payload}: StartVideoProvidorMessage): Promise<void> {
        const providorController = await this.providorService.getProvidorController();
        if (!providorController || providorController.startVideo(payload)) {
            console.error('RootContentController.startVideoFromProvidor: Video could not be started')
        }
    }

    private async getLinkForNextVideo(cb: (data: string) => void): Promise<void> {
        const link = await this.portalService.getPortalController().getLinkForEpisodeWithOffset(1);
        cb(link);
    }

    private async getLinkForPreviousVideo(cb: (data: string) => void): Promise<void> {
        const link = await this.portalService.getPortalController().getLinkForEpisodeWithOffset(-1);
        cb(link);
    }
}
