import { inject, injectable } from 'inversify';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { PortalController } from './portal.controller';
import { VideoController } from './video.controller';
import { MessageService } from '../../shared/services/message.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { ProvidorService } from '../services/providor.service';
import { WindowController } from './window.controller';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import {
    GetAllAvailableSeriesFromPortalMessage,
    GetSeriesEpisodesForSeasonMessage,
    GetSeriesInformationFromPortalMessage,
    OpenNextVideoMessage,
    OpenPreviousVideoMessage,
    RecaptchaRecognizedMessage,
    StartEpisodeMessage,
    StartSeriesMessage,
    ToggleFullscreenModeMessage,
    VideoFinishedMessage,
    WindowResizedMessage
} from '../../browserMessages/messages/background.messages';
import { getSeriesByKey } from '../../store/selectors/series.selector';
import { resetControlStateAction, setWindowIdForWindowTypeAction } from '../../store/reducers/control-state.reducer';
import { OpenWindowConfig, WindowService } from '../services/window.service';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import { SeriesMetaInfoDto } from '../../dto/series-meta-info.dto';
import { SeriesService } from '../../shared/services/series.service';
import Series from '../../store/models/series.model';
import SeriesEpisode from '../../store/models/series-episode.model';
import {
    getNextEpisode,
    getPreviousEpisode,
    getSeriesEpisodeByKey
} from '../../store/selectors/series-episode.selector';
import { PROVIDORS } from '../../store/enums/providors.enum';
import { WindowType } from '../../store/enums/window-type.enum';
import { FRAME_HEIGHT, FRAME_WIDTH } from '../../shared/constants/electron-data';
import { PORTALS } from '../../store/enums/portals.enum';

@injectable()
export class RootBackgroundController {

    private readonly appWindowConfig: OpenWindowConfig = {
        nodeIntegration: true,
        visible: true,
        preloadScript: false
    };

    private isInitialized = false;

    constructor(@inject(BACKGROUND_TYPES.PortalController) private readonly portalController: PortalController,
                @inject(BACKGROUND_TYPES.VideoController) private readonly videoController: VideoController,
                @inject(BACKGROUND_TYPES.WindowController) private readonly windowController: WindowController,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
                @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(SHARED_TYPES.SeriesService) private readonly seriesService: SeriesService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService,
                @inject(BACKGROUND_TYPES.ProvidorService) private readonly providorService: ProvidorService) {
    }

    public initialize(): void {
        if (!this.isInitialized) {
            this.initializeHandler();
            this.isInitialized = true;
        }
    }

    public openStartPage(): void {
        let href: string;
        const isDev = process.env.WEBPACK_DEV_SERVER_URL;
        if (isDev) {
            href = process.env.WEBPACK_DEV_SERVER_URL as string;
            this.windowService.addReduxDevTools();
        } else {
            createProtocol('app');
            href = 'app://./index.html';
        }

        const window = this.windowService.openWindow(href, this.appWindowConfig);
        this.windowService.replaceReferrer(window.webContents.session);

        this.store.dispatch(setWindowIdForWindowTypeAction({ windowId: window.id, windowType: WindowType.APP }));
        if (isDev) {
            window.webContents.openDevTools();
        }
    }

    private initializeHandler(): void {
        ipcMain.handle(MessageType.BACKGROUND_VIDEO_FINISHED, (event, message: VideoFinishedMessage) => {
            this.videoFinishedHandler();
        });

        ipcMain.handle(MessageType.BACKGROUND_TOGGLE_FULLSCREEN, (event, message: ToggleFullscreenModeMessage) => {
            this.windowController.toggleWindowState();
        });

        ipcMain.handle(MessageType.BACKGROUND_WINDOW_RESIZED, (event, message: WindowResizedMessage) => {
            this.windowController.setCurrentWindowState();
        });

        ipcMain.handle(MessageType.BACKGROUND_NEXT_VIDEO, (event, message: OpenNextVideoMessage) => {
            this.nextVideoHandler(message);
        });

        ipcMain.handle(MessageType.BACKGROUND_PREVIOUS_VIDEO, (event, message: OpenPreviousVideoMessage) => {
            this.previousVideoHandler(message);
        });

        ipcMain.handle(MessageType.BACKGROUND_CONTINUE_SERIES, (event, message: StartSeriesMessage) => {
            console.log('in continue series handler');
            this.continueSeriesHandler(message);
        });

        ipcMain.handle(MessageType.BACKGROUND_START_EPISODE, (event, message: StartEpisodeMessage): void => {
            this.startEpisodeHandler(message);
        });

        ipcMain.handle(MessageType.BACKGROUND_GET_ALL_SERIES_FROM_PORTAL,
            // async (event, message: GetAllAvailableSeriesFromPortalMessage): Promise<SeriesMetaInfoDto[]> => {
            (event, message: GetAllAvailableSeriesFromPortalMessage) => {
                return this.getAllVideosFromPortalHandler(message);
            });

        ipcMain.handle(MessageType.BACKGROUND_GET_SERIES_INFORMATION,
            async (event, message: GetSeriesInformationFromPortalMessage): Promise<Series> => {
                return this.getSeriesInformationFromPortalHandler(message);
            });

        ipcMain.handle(MessageType.BACKGROUND_GET_SERIES_EPISODES_FOR_SEASON,
            async (event, message: GetSeriesEpisodesForSeasonMessage): Promise<SeriesEpisode[]> => {
                console.log(message);
                return this.getSeriesEpisodeForSeasonHandler(message);
            });

        ipcMain.handle(MessageType.BACKGROUND_RECAPTCHA_RECOGNIZED,
            (event, message: RecaptchaRecognizedMessage): void => {
                this.recaptchaRecognizedHandler(event, message);
            });
    }

    public async startEpisodeHandler(message: StartEpisodeMessage): Promise<void> {
        this.store.stopPlayer();
        const { portal, episodeKey } = message.payload;
        await this.startEpisode(episodeKey, portal);
    }

    private async videoFinishedHandler(): Promise<void> {
            this.store.stopPlayer();
            // await this.portalController.openNextEpisode();
    }

    private async previousVideoHandler({payload}: OpenPreviousVideoMessage): Promise<void> {
        this.store.stopPlayer();
        const previousEpisode = this.store.selectSync(getPreviousEpisode, payload);
        if(previousEpisode) {
            await this.startEpisode(previousEpisode.key, PORTALS.BS);
        }
    }

    private async nextVideoHandler({payload}: OpenNextVideoMessage): Promise<void> {
        this.store.stopPlayer();
        const nextEpisode = this.store.selectSync(getNextEpisode, payload);
        if(nextEpisode) {
            await this.startEpisode(nextEpisode.key, PORTALS.BS);
        }
    }

    private continueSeriesHandler({ payload }: StartSeriesMessage): void {
        this.resetController();
        this.store.stopPlayer();
        const series = this.store.selectSync(getSeriesByKey, payload);
        const seriesEpisode = this.store.selectSync(getSeriesEpisodeByKey, series?.lastEpisodeWatched);

        // TO-DO replace hardcoded Vivo with last used Providor
        this.videoController.startVideo(seriesEpisode, PROVIDORS.Vivo);
    }

    private async getAllVideosFromPortalHandler({ payload }: GetAllAvailableSeriesFromPortalMessage): Promise<SeriesMetaInfoDto[]> {
        return this.portalController.getAllSeriesFromPortal(payload);
    }

    private async getSeriesInformationFromPortalHandler({ payload }: GetSeriesInformationFromPortalMessage): Promise<Series> {
        console.log('getSeriesInformationFromPortalHandler', payload);
        const seriesInfo = await this.portalController.getSeriesInformation(payload);
        return this.seriesService.addSeries(seriesInfo);
    }

    private async getSeriesEpisodeForSeasonHandler(message: GetSeriesEpisodesForSeasonMessage): Promise<SeriesEpisode[]> {
        const { portal, seriesSeasonKey } = message.payload;

        const episodeDtos = await this.portalController.getEpisodesForSeason(seriesSeasonKey, portal);
        console.log(episodeDtos);
        return this.seriesService.addSeriesEpisodes(episodeDtos);
    }

    private recaptchaRecognizedHandler(event: IpcMainInvokeEvent, message: RecaptchaRecognizedMessage): void {
        const window = BrowserWindow.fromWebContents(event.sender);
        const { width, height } = message.payload;
        window.setSize(width + FRAME_WIDTH, height + FRAME_HEIGHT);
        window.show();
    }

    private resetController(): void {
        this.store.dispatch(resetControlStateAction());
        this.store.stopPlayer();
        this.videoController.reset();
    }

    private async startEpisode(episodeKey: SeriesEpisode['key'], portal: PORTALS): Promise<boolean> {
        const providorLink = await this.portalController.getProvidorLinkForEpisode(episodeKey, portal);

        if (providorLink.link) {
            const episodeInfo = this.seriesService.addProvidorLinkToSeries(episodeKey, providorLink);
            return this.videoController.startVideo(episodeInfo, providorLink.providor);
        }
        return false;
    }

}
