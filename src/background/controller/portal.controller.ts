import { inject, injectable } from 'inversify';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { TabController } from './tab.controller';
import { VideoController } from './video.controller';
import { first } from 'rxjs/operators';
import Series from '../../store/models/series.model';
import {
    createGetActiveVideoInformation,
    createGetAllSeriesFromPortalMessage,
    createGetEpisodesForSeasonMessage,
    createGetNextVideoLinkMessage,
    createGetPreviousVideoLinkMessage,
    createGetSeriesInformationMessage
} from '../../browserMessages/messages/portal.messages';
import { getLastWatchedSeries } from '../../store/selectors/lastWatchedSeries.selector';
import { getActivePortalTabId, getPortalForKey } from '../../store/selectors/portals.selector';
import Portal from '../../store/models/portal.model';
import { getSeriesByKey } from '../../store/selectors/series.selector';
import { WindowService } from '../services/window.service';
import { fromEvent } from 'rxjs';
import { SeriesMetaInfoDto } from '../../dto/series-meta-info.dto';
import { PORTALS } from '../../store/enums/portals.enum';
import { setActivePortalTabIdAction } from '../../store/reducers/control-state.reducer';
import { SeriesSeason } from '../../store/models/series-season.model';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { Message } from '../../browserMessages/messages/message.interface';
import { getSeriesSeasonByKey } from '../../store/selectors/series-season.selector';

@injectable()
export class PortalController {


    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService,
                @inject(BACKGROUND_TYPES.TabController) private readonly tabController: TabController,
                @inject(BACKGROUND_TYPES.VideoController) private readonly videoController: VideoController) {
    }


    public async getAllSeriesFromPortal(portalKey: PORTALS): Promise<SeriesMetaInfoDto[]> {
        const portal = this.store.selectSync(getPortalForKey, portalKey);
        return this.openPageAndGetDataForMessage(portal.seriesListUrl, createGetAllSeriesFromPortalMessage());
    }

    public async getSeriesInformation(seriesInfo: SeriesMetaInfoDto): Promise<SeriesInfoDto> {
        return this.openPageAndGetDataForMessage(seriesInfo.link, createGetSeriesInformationMessage());
    }

    public async getEpisodesForSeason(seasonKey: string, portal: PORTALS): Promise<SeriesEpisodeDto[]> {
        const seriesSeason = this.store.selectSync(getSeriesSeasonByKey, seasonKey)
        if(seriesSeason) {
            return this.openPageAndGetDataForMessage(seriesSeason.portalLinks[portal], createGetEpisodesForSeasonMessage(seriesSeason.seasonNumber));
        }
        return null
    }

    public async getActiveVideoInformation(withVideoLink: boolean, fallbackPortalUrl?: string): Promise<Series> {
        let result: Series = null;
        const portal = await this.getActivePortal();
        if (portal) {
            this.tabController.startAdBlockerForPortal();
            result = await this.messageService.sendMessageToPortalTab(createGetActiveVideoInformation(withVideoLink));
            this.tabController.stopPortalAdBlock();
        } else if (fallbackPortalUrl) {
            await this.openPortalUrl(fallbackPortalUrl);
            return this.getActiveVideoInformation(withVideoLink);
        } else {
            console.error('PortalController: No portal tab found')
        }

        return result;
    }

    public async openNextEpisode(): Promise<boolean> {
        const lastSeriesWatched = this.store.selectSync(getLastWatchedSeries);

        return false;
    }

    public async openPreviousEpisode(): Promise<boolean> {
        const lastSeriesWatched = this.store.selectSync(getLastWatchedSeries);
        // if (seriesInfo?.lastEpisodeWatched?.hasPreviousEpisode) {
        //     if (!this.store.selectSync(getActivePortalTabId)) {
        //         await this.openPortalUrl(seriesInfo?.lastEpisodeWatched?.portalLinks);
        //     }
        //     const previousEpisode = await this.messageService.sendMessageToPortalTab(createGetPreviousVideoLinkMessage());
        //     if (previousEpisode) {
        //         await this.openPortalUrl(previousEpisode);
        //         return this.openCurrentEpisode();
        //     }
        // }

        return false;

    }

    public async getActivePortal(): Promise<Portal> {
        // const portalTabId = this.store.selectSync(getActivePortalTabId);
        // let tab: Tabs.Tab;
        // if (portalTabId) {
        //     tab = await browser.tabs.get(portalTabId);
        // } else {
        //     const tabs = await browser.tabs.query({active: true, currentWindow: true});
        //     tab = tabs[0];
        // }
        // let portals = this.store.selectSync(getAllPortals);
        // if (tab) {
        //     portals = portals.filter(portal => {
        //         const regex = new RegExp(portal.regex, 'i');
        //         return regex.test(tab.url);
        //     });
        //     if (portals.length) {
        //         this.store.dispatch(setActivePortalAction(portals[0].key));
        //         this.store.dispatch(setActivePortalTabIdAction(tab.id));
        //         return portals[0];
        //     }
        // }

        return null;
    }

    public async startLastWatchedEpisodeOfSeries(seriesKey: Series['key']): Promise<void> {
        const series = await this.store.selectSync(getSeriesByKey, seriesKey);
    }

    public async openPortalUrl(url: string): Promise<void> {
        let window = this.windowService.getPortalWindow();
        if(!window) {
            window = this.windowService.openWindow(url);
            this.store.dispatch(setActivePortalTabIdAction(window.id));
        } else {
            window.webContents.loadURL(url);

        }
        this.tabController.startAdBlockerForPortal();
        return fromEvent<void>(window.webContents,'dom-ready').pipe(
            first()
        ).toPromise();
        // return new Promise(resolve => {
        //     return fromEvent<void>(window.webContents,'dom-ready').pipe(
        //         first()
        //     ).subscribe(() => resolve());
        // });
    }

    private async openPageAndGetDataForMessage<T, R>(portalUrl: string, message: Message<T, R>): Promise<R> {
        await this.openPortalUrl(portalUrl);
        const result = await this.messageService.sendMessageToPortalTab(message);
        this.closePortalWindow();
        return result;
    }

    private closePortalWindow(): void {
        this.windowService.getPortalWindow()?.close();
        this.tabController.stopPortalAdBlock();
    }
}
