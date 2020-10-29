import { inject, injectable } from 'inversify';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { PortalController } from './portal.controller';
import { VideoController } from './video.controller';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import {
    CloseWindowMessage,
    ContinueAutoplayForEpisodeMessage,
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
import {
    raisePlayedEpisodesAction,
    resetControlStateAction,
    resetPlayedEpisodesAction,
    setActiveEpisodeAction,
    setWindowIdForWindowTypeAction
} from '../../store/reducers/control-state.reducer';
import { WindowService } from '../services/window.service';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import { SeriesService } from '../services/series.service';
import SeriesEpisode from '../../store/models/series-episode.model';
import { getPreviousEpisode, getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';
import { WindowType } from '../../store/enums/window-type.enum';
import { PORTALS } from '../../store/enums/portals.enum';
import {
    addProvidorLinkToEpisodeAction,
    removeProvidorLinkFromEpisodeAction
} from '../../store/reducers/series-episode.reducer';
import { environment } from '../../environments/environment';
import Providor from '../../store/models/providor.model';
import { getAllUsedProvidors } from '../../store/selectors/providors.selector';
import { OpenWindowConfig } from '../data/types/open-window-config.type';
import { setLastUsedPortalForSeriesAction } from '../../store/reducers/series.reducer';
import { DefaultOpenWindowConfig } from '../data/open-window-config-default.data';
import { APP_HEIGHT, APP_WIDTH } from '../../constants/electron-variables';

@injectable()
export class RootBackgroundController {

    private readonly appWindowConfig: OpenWindowConfig = {
        nodeIntegration: true,
        visible: true,
        preloadScript: false,
        manipulateSession: true,
        width: environment.openAppDevTools ? DefaultOpenWindowConfig.width : APP_WIDTH,
        height: environment.openAppDevTools ? DefaultOpenWindowConfig.height : APP_HEIGHT,
    };

    constructor(@inject(BACKGROUND_TYPES.PortalController) private readonly portalController: PortalController,
                @inject(BACKGROUND_TYPES.VideoController) private readonly videoController: VideoController,
                @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(BACKGROUND_TYPES.SeriesService) private readonly seriesService: SeriesService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService) {
    }

    public openApp(): void {
        let href: string;
        const { isDev, openAppDevTools } = environment;
        if (isDev) {
            href = process.env.WEBPACK_DEV_SERVER_URL as string;
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

    public initializeHandler(): void {
        ipcMain.handle(MessageType.BACKGROUND_VIDEO_FINISHED, (event, message: VideoFinishedMessage) => {
            this.videoFinishedHandler(message);
        });

        ipcMain.handle(MessageType.BACKGROUND_CONTINUE_AUTOPLAY, (event, message: ContinueAutoplayForEpisodeMessage) => {
            this.continueAutoplayHandler(message);
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

        ipcMain.handle(MessageType.BACKGROUND_START_EPISODE, (event, message: StartEpisodeMessage): Promise<boolean> | boolean => {
            try {
                return this.startEpisodeHandler(message);
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
                return this.loadSeriesEpisodeForSeasonHandler(message);
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

    private async startEpisodeHandler(message: StartEpisodeMessage): Promise<boolean> {
        this.store.stopPlayer();
        const { portal, episodeKey } = message.payload;
        this.store.dispatch(resetPlayedEpisodesAction());

        const success = await this.startEpisode(episodeKey, portal);
        if (success) {
            this.store.dispatch(raisePlayedEpisodesAction());
        }

        return success;
    }

    private async videoFinishedHandler({ payload }: VideoFinishedMessage): Promise<void> {
        this.store.stopPlayer();
        const success = await this.startNextEpisode(payload);
        if (success) {
            this.store.dispatch(raisePlayedEpisodesAction());
        }

    }

    private async continueAutoplayHandler({ payload }: ContinueAutoplayForEpisodeMessage): Promise<void> {
        this.store.stopPlayer();
        this.store.dispatch(resetPlayedEpisodesAction());
        const success = await this.startNextEpisode(payload);
        if (success) {
            this.store.dispatch(raisePlayedEpisodesAction());
        }
    }

    private async previousVideoHandler({ payload }: OpenPreviousVideoMessage): Promise<void> {
        this.store.stopPlayer();
        const previousEpisode = this.store.selectSync(getPreviousEpisode, payload);
        if (previousEpisode) {
            await this.startEpisode(previousEpisode.key, PORTALS.BS);

        }
    }

    private async nextVideoHandler({ payload }: OpenNextVideoMessage): Promise<void> {
        this.store.stopPlayer();
        await this.startNextEpisode(payload);
    }

    private async continueSeriesHandler({ payload }: StartSeriesMessage): Promise<void> {
        this.resetController();
        this.store.stopPlayer();
        const seriesEpisode = await this.seriesService.getContinuableEpisodeForSeries(payload, PORTALS.BS);
        if (!seriesEpisode) {
            return;
        }

        // TO-DO replace hardcoded Vivo with last used Providor
        const success = this.startEpisode(seriesEpisode.key, PORTALS.BS);
        if (success) {
            this.store.dispatch(raisePlayedEpisodesAction());
        }
    }

    private async loadAllVideosFromPortalHandler({ payload }: PortalSelectedInAppMessage): Promise<void> {
        await this.seriesService.updateAllSeriesForPortal(payload);
    }

    private async loadSeriesInformationFromPortalHandler({ payload }: SeriesSelectedInAppMessage): Promise<void> {
        const { portal, seriesKey } = payload;

        await this.seriesService.updateSeriesForPortal(seriesKey, portal);
    }

    private async loadSeriesEpisodeForSeasonHandler(message: SeriesSeasonSelectedInAppMessage): Promise<void> {
        const { portal, seriesSeasonKey } = message.payload;

        await this.seriesService.updateSeasonForPortal(seriesSeasonKey, portal);
    }

    private recaptchaRecognizedHandler(event: IpcMainInvokeEvent, message: RecaptchaRecognizedMessage): void {
        const window = BrowserWindow.fromWebContents(event.sender);
        const { width, height } = message.payload;
        window.setSize(width, height);
        window.webContents.closeDevTools();
        window.show();
    }

    private closeWindowEventHandler(event: IpcMainInvokeEvent, message: CloseWindowMessage): void {
        const windowId = message.payload;
        this.windowService.closeWindow(windowId, true);
    }

    private toggleWindowMaximizationEventHandler(event: IpcMainInvokeEvent, message: ToggleWindowMaximizationMessage): void {
        const windowId = message.payload;
        this.windowService.toggleMaximization(windowId);
    }

    private toggleWindowFullscreenEventHandler(event: IpcMainInvokeEvent, message: ToggleWindowFullscreenMessage): void {
        const windowId = message.payload;
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

    private async startNextEpisode(episodeKey: SeriesEpisode['key']): Promise<boolean> {
        const nextEpisode = await this.seriesService.getNextEpisode(episodeKey);
        if (nextEpisode) {
            return this.startEpisode(nextEpisode.key, PORTALS.BS);
        }

        return false;
    }

    private async startEpisode(episodeKey: SeriesEpisode['key'], portal: PORTALS): Promise<boolean> {
        this.store.dispatch(setActiveEpisodeAction(episodeKey));
        const episode = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);

        const usedProvidors = this.store.selectSync(getAllUsedProvidors);
        for (let provider of usedProvidors) {
            const result = this.startEpisodeForProvidor(episode, portal, provider);
            if (result) {
                return true;
            }
        }

        this.store.dispatch(setActiveEpisodeAction(null));
        return false;
    }

    private async startEpisodeForProvidor(episode: SeriesEpisode, portal: PORTALS, providor: Providor): Promise<boolean> {
        const episodeKey = episode.key;
        if (!episode.providorLinks[providor.key]) {
            const providorLink = await this.portalController.getProvidorLinkForEpisode(episode.key, portal);

            if (providorLink.link) {
                this.store.dispatch(addProvidorLinkToEpisodeAction({ episodeKey, providorLink }));
            } else {
                return false;
            }
        }

        const result = await this.videoController.startVideo(episodeKey, providor.key);

        if (!result) {
            this.store.dispatch(removeProvidorLinkFromEpisodeAction({ episodeKey, providorKey: providor.key }));
        } else {
            this.store.dispatch(setLastUsedPortalForSeriesAction({ seriesKey: episode.seriesKey, portal }));
        }

        return result;
    }
}
