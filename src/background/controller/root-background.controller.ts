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
    CloseWindowMessage,
    MinimizeWindowMessage,
    OpenNextVideoMessage,
    OpenPreviousVideoMessage,
    PortalSelectedInAppMessage,
    RecaptchaRecognizedMessage,
    SeriesSeasonSelectedInAppMessage,
    SeriesSelectedInAppMessage,
    StartEpisodeMessage,
    StartSeriesMessage,
    ToggleWindowFullscreenMessage,
    ToggleWindowMaximizationMessage,
    VideoFinishedMessage
} from '../../browserMessages/messages/background.messages';
import { getSeriesByKey } from '../../store/selectors/series.selector';
import {
    resetControlStateAction,
    setActiveEpisodeAction,
    setWindowIdForWindowTypeAction
} from '../../store/reducers/control-state.reducer';
import { OpenWindowConfig, WindowService } from '../services/window.service';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import { SeriesService } from '../../shared/services/series.service';
import SeriesEpisode from '../../store/models/series-episode.model';
import {
    getNextEpisode,
    getPreviousEpisode,
    getSeriesEpisodeByKey
} from '../../store/selectors/series-episode.selector';
import { PROVIDORS } from '../../store/enums/providors.enum';
import { WindowType } from '../../store/enums/window-type.enum';
import { PORTALS } from '../../store/enums/portals.enum';
import { addProvidorLinkToEpisodeAction } from '../../store/reducers/series-episode.reducer';
import { environment } from '../../../environments/environment';

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
        const { isDev, openAppDevTools } = environment;
        if(isDev) {
            href = process.env.WEBPACK_DEV_SERVER_URL as string;
            // this.windowService.addReduxDevTools();
        } else {
            createProtocol('app');
            href = 'app://./index.html';
        }

        const window = this.windowService.openWindow(href, this.appWindowConfig);

        this.store.dispatch(setWindowIdForWindowTypeAction({ windowId: window.id, windowType: WindowType.APP }));

        if (openAppDevTools) {
            window.webContents.openDevTools();
        }
    }

    private initializeHandler(): void {
        ipcMain.handle(MessageType.BACKGROUND_VIDEO_FINISHED, (event, message: VideoFinishedMessage) => {
            this.videoFinishedHandler();
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

        ipcMain.handle(MessageType.BACKGROUND_START_EPISODE, (event, message: StartEpisodeMessage): Promise<boolean>| boolean => {
            try {
                return  this.startEpisodeHandler(message);
            } catch (e) {
                return false;
            }
        });

        ipcMain.handle(MessageType.BACKGROUND_PORTAL_SELECTED_IN_APP,
            // async (event, message: GetAllAvailableSeriesFromPortalMessage): Promise<SeriesMetaInfoDto[]> => {
            (event, message: PortalSelectedInAppMessage) => {
                return this.loadAllVideosFromPortalHandler(message);
            });

        ipcMain.handle(MessageType.BACKGROUND_SERIES_SELECTED_IN_APP,
            async (event, message: SeriesSelectedInAppMessage): Promise<void> => {
                return this.loadSeriesInformationFromPortalHandler(message);
            });

        ipcMain.handle(MessageType.BACKGROUND_SERIES_SEASON_SELECTED_IN_APP,
            async (event, message: SeriesSeasonSelectedInAppMessage): Promise<void> => {
                console.log(message);
                return this.getSeriesEpisodeForSeasonHandler(message);
            });

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
    }

    public async startEpisodeHandler(message: StartEpisodeMessage): Promise<boolean> {
        this.store.stopPlayer();
        const { portal, episodeKey } = message.payload;
        return this.startEpisode(episodeKey, portal);
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
        this.videoController.startVideo(seriesEpisode.key, PROVIDORS.Vivo);
    }

    private async loadAllVideosFromPortalHandler({ payload }: PortalSelectedInAppMessage): Promise<void> {
        const multipleSeriesMetaInfo = await this.portalController.getAllSeriesFromPortal(payload);
        this.seriesService.addMultipleSeriesToStore(multipleSeriesMetaInfo);
    }

    private async loadSeriesInformationFromPortalHandler({ payload }: SeriesSelectedInAppMessage): Promise<void> {
        const seriesInfo = await this.portalController.getDetailedSeriesInformation(payload.seriesKey, payload.portal);
        this.seriesService.addSeriesToStore(seriesInfo);
    }

    private async getSeriesEpisodeForSeasonHandler(message: SeriesSeasonSelectedInAppMessage): Promise<void> {
        const { portal, seriesSeasonKey } = message.payload;

        const episodeDtos = await this.portalController.getEpisodesForSeason(seriesSeasonKey, portal);
        return this.seriesService.addSeriesEpisodesToStore(episodeDtos);
    }

    private recaptchaRecognizedHandler(event: IpcMainInvokeEvent, message: RecaptchaRecognizedMessage): void {
        const window = BrowserWindow.fromWebContents(event.sender);
        const { width, height } = message.payload;
        window.setSize(width, height);
        window.show();
    }

    private closeWindowEventHandler(event: IpcMainInvokeEvent, message: CloseWindowMessage): void {
        const windowId = message.payload;
        this.windowService.closeWindow(windowId);
    }

    private toggleWindowMaximizationEventHandler(event: IpcMainInvokeEvent, message: ToggleWindowMaximizationMessage): void {
        const windowId = message.payload;
        console.log('window fullscreen event handler')
        this.windowService.toggleMaximization(windowId);
    }

    private toggleWindowFullscreenEventHandler(event: IpcMainInvokeEvent, message: ToggleWindowFullscreenMessage): void {
        const windowId = message.payload;
        console.log('window fullscreen event handler')
        this.windowService.toggleFullscreen(windowId);
    }

    private minimizeWindowEventHandler(event: IpcMainInvokeEvent, message: MinimizeWindowMessage): void {
        const windowId = message.payload;
        this.windowService.minimizeWindow(windowId);
    }

    private resetController(): void {
        this.store.dispatch(resetControlStateAction());
        this.store.stopPlayer();
        this.videoController.reset();
    }

    private async startEpisode(episodeKey: SeriesEpisode['key'], portal: PORTALS): Promise<boolean> {
        this.store.dispatch(setActiveEpisodeAction(episodeKey));
        const providorLink = await this.portalController.getProvidorLinkForEpisode(episodeKey, portal);

        let result = false;
        if (providorLink.link) {
            this.store.dispatch(addProvidorLinkToEpisodeAction({ episodeKey, providorLink }));
            result = await this.videoController.startVideo(episodeKey, providorLink.providor);
        }

        if(!result) {
            this.store.dispatch(setActiveEpisodeAction(null));
        }

        return result;
    }

}
