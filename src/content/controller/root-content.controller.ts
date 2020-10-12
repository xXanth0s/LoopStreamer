import { inject, injectable } from 'inversify';
import { CONTENT_TYPES } from '../container/CONTENT_TYPES';
import { PortalService } from '../services/portal.service';
import { ProvidorService } from '../services/providor.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import {
    GetAllSeriesFromPortalMessage,
    GetEpisodesForSeasonMessage,
    GetProvidorLinkForEpisode,
    GetSeriesInformationMessage
} from '../../browserMessages/messages/portal.messages';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { StartVideoProvidorMessage } from '../../browserMessages/messages/providor.messages';
import { TestController } from './test.controller';
import { RecaptchaService } from '../services/recaptcha.service';

@injectable()
export class RootContentController {

    constructor(@inject(CONTENT_TYPES.PortalService) private readonly portalService: PortalService,
                @inject(CONTENT_TYPES.ProvidorService) private readonly providorService: ProvidorService,
                @inject(CONTENT_TYPES.RecaptchaService) private readonly recaptchaService: RecaptchaService,
                @inject(CONTENT_TYPES.TestController) private readonly testController: TestController,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService) {
        document.addEventListener('DOMContentLoaded', () => {
            this.recaptchaService.checkForRecaptcha();
        })
    }

    public init(): void {
        ipcRenderer.on(MessageType.PORTAL_GET_PROVIDOR_LINK_FOR_EPISODE, (event, message: GetProvidorLinkForEpisode) => {
            this.getProvidorLinkHandler(event, message);
        });

        ipcRenderer.on(MessageType.PORTAL_GET_ALL_SERIES, (event, message: GetAllSeriesFromPortalMessage) => {
            console.log(message);
            this.getAllSeriesFromPortalHandler(event, message);
        });

        ipcRenderer.on(MessageType.PORTAL_GET_SERIES_META_INFORMATION, (event, message: GetSeriesInformationMessage) => {
            console.log(message);
            this.getSeriesMetaInformationHandler(event, message);
        });

        ipcRenderer.on(MessageType.PORTAL_GET_EPISODES_FOR_SEASON, (event, message: GetEpisodesForSeasonMessage) => {
            console.log(message);
            this.getSeasonsEpisodeInformationHandler(event, message);
        });

        ipcRenderer.on(MessageType.PROVIDOR_START_VIDEO, (event, message: StartVideoProvidorMessage) => {
            console.log(message);
            this.startVideoForProvidorHandler(event, message);
        });

        ipcRenderer.on(MessageType.TEST_CONTENT_START_TEST_RECAPTCHA, (event, message: StartVideoProvidorMessage) => {
            this.testController.executeRecaptchaChallenge();
        });

    }

    private async getProvidorLinkHandler(event: IpcRendererEvent, message: GetProvidorLinkForEpisode): Promise<void> {
        const {providor, episodeInfo} = message.payload;
        const result = await this.portalService.getPortalController().getProvidorLinkForEpisode(episodeInfo, providor);
        this.messageService.replyToSender(message, event.sender, result);
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

    private startVideoForProvidorHandler(event: Electron.IpcRendererEvent, message: StartVideoProvidorMessage) {
        const {providor, episodeInfo} = message.payload;
        this.providorService.getProvidorController(providor)?.startVideo(episodeInfo)
    }
}
