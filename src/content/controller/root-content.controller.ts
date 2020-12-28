import { inject, injectable } from 'inversify';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { CONTENT_TYPES } from '../container/CONTENT_TYPES';
import { PortalFactory } from '../factories/portal.factory';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import {
    GetAllProvidorLinksForEpisodeMessage,
    GetDetailedSeriesInformationMessage,
    GetResolvedProvidorLinkForEpisode,
    GetSeasonInfoMessage,
    GetSeriesLinkForPortal,
} from '../../browserMessages/messages/portal.messages';
import { StartVideoMessage } from '../../browserMessages/messages/providor.messages';
import { RecaptchaService } from '../services/recaptcha.service';
// @ts-ignore
import styles from '../styles/content.scss';
import { addCustomFrame } from '../html/custom-frame/custom-frame.component';
import { DEFAULT_TITLE } from '../../constants/electron-variables';
import { getProvidorController } from '../container/content-container.utils';
import { addGlobalFunctions } from '../ustils/global.utils';

@injectable()
export class RootContentController {
    constructor(@inject(CONTENT_TYPES.PortalService) private readonly portalService: PortalFactory,
                @inject(CONTENT_TYPES.RecaptchaService) private readonly recaptchaService: RecaptchaService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService) {
        document.addEventListener('DOMContentLoaded', () => {
            styles.use();
            this.recaptchaService.checkForRecaptcha();
            addCustomFrame();
            window.document.title = DEFAULT_TITLE;
            addGlobalFunctions();
        });
    }

    public init(): void {
        ipcRenderer.on(MessageType.PORTAL_GET_RESOLVED_PROVIDOR_LINK_FOR_EPISODE, (event, message: GetResolvedProvidorLinkForEpisode) => {
            this.getResolvedProvidorLinkHandler(event, message);
        });

        ipcRenderer.on(MessageType.PORTAL_GET_SERIES_LINK_FOR_PORTAL, (event, message: GetSeriesLinkForPortal) => {
            console.log(message);
            this.getLinkForSeriesFromPortalHandler(event, message);
        });

        ipcRenderer.on(MessageType.PORTAL_GET_SERIES_META_INFORMATION, (event, message: GetDetailedSeriesInformationMessage) => {
            console.log(message);
            this.getDetailedSeriesInformationHandler(event, message);
        });

        ipcRenderer.on(MessageType.PORTAL_GET_SEASON_INFO, (event, message: GetSeasonInfoMessage) => {
            console.log(message);
            this.getSeasonsEpisodeInformationHandler(event, message);
        });

        ipcRenderer.on(MessageType.PROVIDOR_START_VIDEO, (event, message: StartVideoMessage) => {
            console.log(message);
            this.startVideoForProvidorHandler(event, message);
        });

        ipcRenderer.on(MessageType.PORTAL_GET_ALL_PROVIDOR_LINKS, (event, message: GetAllProvidorLinksForEpisodeMessage) => {
            console.log(message);
            this.getAllProvidorLinksForEpisode(event, message);
        });
    }

    private async getResolvedProvidorLinkHandler(event: IpcRendererEvent, message: GetResolvedProvidorLinkForEpisode): Promise<void> {
        const { providor, episodeInfo, portal } = message.payload;
        const result = await this.portalService.getPortalController(portal).getResolvedProvidorLinkForEpisode(episodeInfo, providor);
        this.messageService.replyToSender(message, event.sender, result);
    }

    private getAllProvidorLinksForEpisode(event: IpcRendererEvent, message: GetAllProvidorLinksForEpisodeMessage): void {
        const { language, portal } = message.payload;
        const result = this.portalService.getPortalController(portal).getAllPortalProviderLinksForEpisode(language);
        this.messageService.replyToSender(message, event.sender, result);
    }

    private async getLinkForSeriesFromPortalHandler(event: IpcRendererEvent, message: GetSeriesLinkForPortal): Promise<void> {
        const { portal, seriesKey } = message.payload;
        const seriesLink = await this.portalService.getPortalController(portal)?.getLinkForSeries(seriesKey);
        this.messageService.replyToSender(message, event.sender, seriesLink);
    }

    private async getDetailedSeriesInformationHandler(event: IpcRendererEvent, message: GetDetailedSeriesInformationMessage): Promise<void> {
        const { portal } = message.payload;
        const seriesInfo = await this.portalService.getPortalController(portal)?.getSeriesMetaInformation();
        this.messageService.replyToSender(message, event.sender, seriesInfo);
    }

    private async getSeasonsEpisodeInformationHandler(event: IpcRendererEvent, message: GetSeasonInfoMessage): Promise<void> {
        const { portal, seasonNumber } = message.payload;
        const seasonInfo = await this.portalService.getPortalController(portal)?.getSeasonInfo(seasonNumber);
        this.messageService.replyToSender(message, event.sender, seasonInfo);
    }

    private startVideoForProvidorHandler(event: Electron.IpcRendererEvent, message: StartVideoMessage): void {
        const { providor, episodeKey } = message.payload;
        const result = Boolean(getProvidorController(providor)?.startVideo(episodeKey));
        this.messageService.replyToSender(message, event.sender, result);
    }
}
