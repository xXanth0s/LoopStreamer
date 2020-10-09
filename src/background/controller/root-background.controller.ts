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
    StartEpisodeMessage,
    StartSeriesMessage,
    ToggleFullscreenModeMessage,
    VideoFinishedMessage,
    WindowResizedMessage
} from '../../browserMessages/messages/background.messages';
import { getSeriesByKey } from '../../store/selectors/series.selector';
import {
    resetControlStateAction,
    setActivePortalTabIdAction,
    setOptionsWindowIdAction
} from '../../store/reducers/control-state.reducer';
import { WindowService } from '../services/window.service';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { ipcMain, session } from 'electron';
import { SeriesMetaInfoDto } from '../../dto/series-meta-info.dto';
import { SeriesService } from '../../shared/services/series.service';
import Series from '../../store/models/series.model';
import SeriesEpisode from '../../store/models/series-episode.model';
import { getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';
import { PROVIDORS } from '../../store/enums/providors.enum';
import Website from '../../store/models/website';
import { createGetAllSeriesFromPortalMessage } from '../../browserMessages/messages/portal.messages';
import { switchMap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { waitTillPageLoadFinished } from '../../utils/rxjs.util';
import { createStartTestRecaptcha } from '../../browserMessages/messages/test.messages';

@injectable()
export class RootBackgroundController {

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
            const sessionInstance = session.fromPartition('persist:');
            this.windowService.setDefaultUserAgent(sessionInstance);
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

        const window = this.windowService.openWindow(href, { nodeIntegration: true, visible: true, preloadScript: false });
        this.store.dispatch(setOptionsWindowIdAction(window.id));
        if (isDev) {
            window.webContents.openDevTools();
        }
    }

    private initializeHandler(): void {
        ipcMain.on(MessageType.BACKGROUND_VIDEO_FINISHED, (event, message: VideoFinishedMessage) => {
            this.videoFinishedHandler();
        });

        ipcMain.on(MessageType.BACKGROUND_TOGGLE_FULLSCREEN, (event, message: ToggleFullscreenModeMessage) => {
            this.windowController.toggleWindowState();
        });

        ipcMain.on(MessageType.BACKGROUND_WINDOW_RESIZED, (event, message: WindowResizedMessage) => {
            this.windowController.setCurrentWindowState();
        });

        ipcMain.on(MessageType.BACKGROUND_NEXT_VIDEO, (event, message: OpenNextVideoMessage) => {
            this.nextVideoHandler();
        });

        ipcMain.on(MessageType.BACKGROUND_PREVIOUS_VIDEO, (event, message: OpenPreviousVideoMessage) => {
            this.previousVideoHandler();
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
                    // const newMessage = createStartEpisodeMessage('24-S5-E4', PORTALS.BS);
                    // this.startEpisodeHandler(newMessage);
                // return this.getAllVideosFromPortalHandler(message);
                this.testRecaptchaHandler();
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
    }

    private async videoFinishedHandler(): Promise<void> {
        if (this.windowController.isUserOnVideoTab()) {
            this.store.stopPlayer();
            // await this.portalController.openNextEpisode();
        }
    }

    private async previousVideoHandler(): Promise<void> {
        this.store.stopPlayer();
        // const isNextVideoAvailable = await this.portalController.openPreviousEpisode();
        // if (!isNextVideoAvailable) {
        //     console.error(`${MessageType.BACKGROUND_PREVIOUS_VIDEO}: no next episode available`)
        // }
    }

    private async nextVideoHandler(): Promise<void> {
        this.store.stopPlayer();
        // const isNextVideoAvailable = await this.portalController.openNextEpisode();
        // if (!isNextVideoAvailable) {
        //     console.error(`${MessageType.BACKGROUND_NEXT_VIDEO}: no next episode available`)
        // }
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

    private async startEpisodeHandler(message: StartEpisodeMessage): Promise<void> {
        this.store.stopPlayer();
        const { portal, episodeKey } = message.payload;
        const providorLink = await this.portalController.getProvidorLinkForEpisode(episodeKey, portal);

        console.log('providorLink', providorLink);
        console.log(providorLink);
        if (providorLink.link) {
            const episodeInfo = this.seriesService.addProvidorLinkToSeries(episodeKey, providorLink);
            this.videoController.startVideo(episodeInfo, providorLink.providor);
        }
    }

    private testRecaptchaHandler(): void {
        const testWebsite: Website = {
            baseUrl: 'localhost',
            urlRegex: 'localhost',
        };

        this.windowController.openLinkForWebsite(testWebsite, 'http://localhost:4200/').pipe(
            waitTillPageLoadFinished()
        ).subscribe(window => {
            this.store.dispatch(setActivePortalTabIdAction(window.id));
            this.messageService.sendMessageToPortalTab(createStartTestRecaptcha());
        })
    }

    private resetController(): void {
        this.store.dispatch(resetControlStateAction());
        this.store.stopPlayer();
        this.videoController.reset();
    }

}
