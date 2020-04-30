import {inject, injectable} from 'inversify';
import {StoreService} from '../../shared/services/store.service';
import {SHARED_TYPES} from '../../shared/constants/SHARED_TYPES';
import {MessageService} from '../../shared/services/message.service';
import {BACKGROUND_TYPES} from '../container/BACKGROUND_TYPES';
import {TabController} from './tab.controller';
import {VideoController} from './video.controller';
import { filter, first, takeUntil } from 'rxjs/operators';
import Series from '../../store/models/series.model';
import {
    createGetActiveVideoInformation,
    createGetNextVideoLinkMessage, createGetPreviousVideoLinkMessage
} from '../../browserMessages/messages/portal.messages';
import { getLastWatchedSeries } from '../../store/selectors/lastWatchedSeries.selector';
import { getActivePortalTabId, getAllPortals } from '../../store/selectors/portals.selector';
import Portal from '../../store/models/portal.model';
import { setActivePortalAction, setActivePortalTabIdAction } from '../../store/reducers/control-state.reducer';
import { getSeriesByKey } from '../../store/selectors/series.selector';
import { WindowService } from '../services/window.service';
import { fromEvent } from 'rxjs';

@injectable()
export class PortalController {


    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService,
                @inject(BACKGROUND_TYPES.TabController) private readonly tabController: TabController,
                @inject(BACKGROUND_TYPES.VideoController) private readonly videoController: VideoController) {
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
        const seriesInfo = await this.getActiveVideoInformation(false, lastSeriesWatched?.lastEpisodeWatched?.portalHref);
        if (seriesInfo?.lastEpisodeWatched?.hasNextEpisode) {
            if (!this.store.selectSync(getActivePortalTabId)) {
                await this.openPortalUrl(seriesInfo?.lastEpisodeWatched?.portalHref);
            }
            const nextEpisodeLink = await this.messageService.sendMessageToPortalTab(createGetNextVideoLinkMessage());
            if (nextEpisodeLink) {
                await this.openPortalUrl(nextEpisodeLink);
                return this.openCurrentEpisode();
            }
        }

        return false;
    }

    public async openPreviousEpisode(): Promise<boolean> {
        const lastSeriesWatched = this.store.selectSync(getLastWatchedSeries);
        const seriesInfo = await this.getActiveVideoInformation(false, lastSeriesWatched?.lastEpisodeWatched?.portalHref);
        if (seriesInfo?.lastEpisodeWatched?.hasPreviousEpisode) {
            if (!this.store.selectSync(getActivePortalTabId)) {
                await this.openPortalUrl(seriesInfo?.lastEpisodeWatched?.portalHref);
            }
            const previousEpisode = await this.messageService.sendMessageToPortalTab(createGetPreviousVideoLinkMessage());
            if (previousEpisode) {
                await this.openPortalUrl(previousEpisode);
                return this.openCurrentEpisode();
            }
        }

        return false;

    }

    public async openCurrentEpisode(): Promise<boolean> {
        const seriesInfo = await this.getActiveVideoInformation(true);
        if (seriesInfo?.lastEpisodeWatched?.providorHref) {
            await this.videoController.startVideo(seriesInfo);
            return true;
        }
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
        await this.openPortalUrl(series.lastEpisodeWatched.portalHref);
        this.openCurrentEpisode();
    }

    public async openPortalUrl(url: string): Promise<void> {
        const { webContents } = this.windowService.getPortalWindow();
        webContents.loadURL(url);
        return fromEvent<void>(webContents,'dom-ready').pipe(
            first()
        ).toPromise();

    }
}
