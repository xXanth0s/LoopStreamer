import { inject, injectable } from 'inversify';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { TabController } from './tab.controller';
import { VideoController } from './video.controller';
import { debounceTime, first, mapTo, switchMap, tap } from 'rxjs/operators';
import {
    createGetAllSeriesFromPortalMessage,
    createGetEpisodesForSeasonMessage,
    createGetProvidorLinkForEpisode,
    createGetSeriesInformationMessage
} from '../../browserMessages/messages/portal.messages';
import { getActivePortalTabId, getPortalForKey } from '../../store/selectors/portals.selector';
import { WindowService } from '../services/window.service';
import { fromEvent, Observable } from 'rxjs';
import { SeriesMetaInfoDto } from '../../dto/series-meta-info.dto';
import { PORTALS } from '../../store/enums/portals.enum';
import { setActivePortalTabIdAction } from '../../store/reducers/control-state.reducer';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { Message } from '../../browserMessages/messages/message.interface';
import { getSeriesSeasonByKey } from '../../store/selectors/series-season.selector';
import { getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';
import { ProvidorService } from '../services/providor.service';
import { ProvidorLink } from '../models/providor-link.model';
import { BrowserWindow } from 'electron';
import Portal from '../../store/models/portal.model';

@injectable()
export class PortalController {


    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService,
                @inject(BACKGROUND_TYPES.ProvidorService) private readonly providorService: ProvidorService,
                @inject(BACKGROUND_TYPES.TabController) private readonly tabController: TabController,
                @inject(BACKGROUND_TYPES.VideoController) private readonly videoController: VideoController) {
    }


    public async getAllSeriesFromPortal(portalKey: PORTALS): Promise<SeriesMetaInfoDto[]> {
        const portal = this.store.selectSync(getPortalForKey, portalKey);
        return this.openPageAndGetDataForMessage(portal.seriesListUrl, portal, createGetAllSeriesFromPortalMessage());
    }

    public async getSeriesInformation(seriesInfo: SeriesMetaInfoDto): Promise<SeriesInfoDto> {
        const portal = this.store.selectSync(getPortalForKey, seriesInfo.portal);
        return this.openPageAndGetDataForMessage(seriesInfo.link, portal, createGetSeriesInformationMessage());
    }

    public async getEpisodesForSeason(seasonKey: string, portalKey: PORTALS): Promise<SeriesEpisodeDto[]> {
        const seriesSeason = this.store.selectSync(getSeriesSeasonByKey, seasonKey)
        if(seriesSeason) {
            const portal = this.store.selectSync(getPortalForKey, portalKey);
            return this.openPageAndGetDataForMessage(seriesSeason.portalLinks[portalKey], portal, createGetEpisodesForSeasonMessage(seriesSeason.seasonNumber));
        }
        return null
    }

    public async getProvidorLinkForEpisode(episodeKey: string, portalKey: PORTALS): Promise<ProvidorLink> {
        const episode = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);
        const providor = this.providorService.getCurrentProvidor()?.controllerName;
        const portalLink = episode?.portalLinks[portalKey][providor];
        if(portalLink) {
            const portal = this.store.selectSync(getPortalForKey, portalKey);
            const link = await this.openPageAndGetDataForMessage(portalLink, portal, createGetProvidorLinkForEpisode(episode, providor));
            return {
                providor,
                link
            }
        }
        return null;
    }

    private openPortalUrl(url: string, portal: Portal): Observable<BrowserWindow> {

        // const window = this.windowService.openWindow(url);
        const window$ = this.tabController.getNewWindowsForWebsiteOrLink(portal, url);
        return window$.pipe(
            switchMap((window) => {
                return fromEvent<void>(window.webContents,'dom-ready').pipe(
                    tap(() => this.setNewPortalWindow(window)),
                    debounceTime(1000),
                    first(),
                    mapTo(window),
                );
            } )
        )
    }

    private async openPageAndGetDataForMessage<T, R>(portalUrl: string, portal: Portal, message: Message<T, R>): Promise<R> {
        return new Promise<R>(resolve => {
            // const sub = this.openPortalUrl(portalUrl, portal).subscribe(async (window) => {
            const sub = this.openPortalUrl('https://s.to/redirect/6349887', portal).subscribe(async (window) => {
                // const result = await this.messageService.sendMessageToPortalTab(message);
                // window.close();
                // sub.unsubscribe()
                // resolve(result);
            });
        });
    }

    private setNewPortalWindow(newPortalWindow: Electron.BrowserWindow): void {
        const oldWindowId = this.store.selectSync(getActivePortalTabId);
        if(oldWindowId === newPortalWindow.id) {
            return;
        }

        if(oldWindowId !== undefined) {
            // const oldWindow = BrowserWindow.fromId(oldWindowId);
            // oldWindow?.close();
        }

        this.store.dispatch(setActivePortalTabIdAction(newPortalWindow.id))
    }
}