import { inject, injectable } from 'inversify';
import { CONTENT_TYPES } from '../container/CONTENT_TYPES';
import { PortalService } from '../services/portal.service';
import { ProvidorService } from '../services/providor.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import {
    GetActiveVideoInformation,
    GetAllSeriesFromPortalMessage,
    GetEpisodesForSeasonMessage,
    GetNextVideoLinkMessage,
    GetPreviousVideoLinkMessage,
    GetSeriesInformationMessage
} from '../../browserMessages/messages/portal.messages';
import Series from '../../store/models/series.model';
import { ipcRenderer, IpcRendererEvent } from 'electron';

@injectable()
export class RootContentController {

    constructor(@inject(CONTENT_TYPES.PortalService) private readonly portalService: PortalService,
                @inject(CONTENT_TYPES.ProvidorService) private readonly providorService: ProvidorService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService) {
    }

    public init(): void {
        ipcRenderer.on(MessageType.PORTAL_GET_VIDEO_INFORMATION, (event, message: GetActiveVideoInformation) => {
            this.getVideoInformationHandler(event, message);
        });

        ipcRenderer.on(MessageType.PORTAL_NEXT_EPISODE_LINK, (event, message: GetNextVideoLinkMessage) => {
            this.getNextVideoLinkHandler(event, message);
        });

        ipcRenderer.on(MessageType.PORTAL_PREVIOUS_EPISODE_LINK, (event, message: GetPreviousVideoLinkMessage) => {
            this.getPerviousVideoLinkHandler(event, message)
        });

        ipcRenderer.on(MessageType.PORTAL_GET_ALL_SERIES, (event, message: GetAllSeriesFromPortalMessage) => {
            console.log(message)
            this.getAllSeriesFromPortalHandler(event, message);
        });

        ipcRenderer.on(MessageType.PORTAL_GET_SERIES_META_INFORMATION, (event, message: GetSeriesInformationMessage) => {
            console.log(message)
            this.getSeriesMetaInformationHandler(event, message);
        });

        ipcRenderer.on(MessageType.PORTAL_GET_EPISODES_FOR_SEASON, (event, message: GetEpisodesForSeasonMessage) => {
            console.log(message)
            this.getSeasonsEpisodeInformationHandler(event, message);
        });

    }

    private async getVideoInformationHandler(event: IpcRendererEvent, message: GetActiveVideoInformation): Promise<void> {
        const result = await this.getInformationForOpenVideo(message.payload);
        this.messageService.replyToSender(message, event.sender, result);
    }

    private async getNextVideoLinkHandler(event: IpcRendererEvent, message: GetNextVideoLinkMessage): Promise<void> {
        const link = await this.portalService.getPortalController()?.getLinkForEpisodeWithOffset(1);
        this.messageService.replyToSender(message, event.sender, link);
    }

    private async getPerviousVideoLinkHandler(event: IpcRendererEvent, message: GetNextVideoLinkMessage): Promise<void> {
        const link = await this.portalService.getPortalController()?.getLinkForEpisodeWithOffset(-1);
        this.messageService.replyToSender(message, event.sender, link);
    }

    private async getAllSeriesFromPortalHandler(event: IpcRendererEvent, message: GetAllSeriesFromPortalMessage): Promise<void> {
        const seriesInfo = await this.portalService.getPortalController()?.getAllSeriesInfo();
        this.messageService.replyToSender(message, event.sender, seriesInfo);
    }

    private async getSeriesMetaInformationHandler(event: IpcRendererEvent, message: GetSeriesInformationMessage): Promise<void> {
        const seriesInfo = await this.portalService.getPortalController()?.getSeriesMetaInformation();
        this.messageService.replyToSender(message, event.sender, seriesInfo);
    }

    private async getSeasonsEpisodeInformationHandler(event: IpcRendererEvent, message: GetEpisodesForSeasonMessage): Promise<void> {
        const seriesInfo = await this.portalService.getPortalController()?.getSeasonEpisodes(message.payload);
        this.messageService.replyToSender(message, event.sender, seriesInfo);
    }

    async getInformationForOpenVideo(withVideoLink: boolean): Promise<Series> {
        const providor = this.portalService.getPortalController().isVideoOpenWithProvidor();
        if (providor) {
            this.providorService.setActiveProvidor(providor);
            // const seriesInfo = await this.portalService.getPortalController().getSeriesInfo(withVideoLink);
            // return seriesInfo;
        } else {
            return null;
        }
    }
}
