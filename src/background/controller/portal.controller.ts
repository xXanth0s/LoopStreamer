import { inject, injectable } from 'inversify';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { TabController } from './tab.controller';
import { VideoController } from './video.controller';
import { debounceTime, first, mapTo, switchMap } from 'rxjs/operators';
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
        return this.openPageAndGetDataForMessage(portal.seriesListUrl, createGetAllSeriesFromPortalMessage());
    }

    public async getSeriesInformation(seriesInfo: SeriesMetaInfoDto): Promise<SeriesInfoDto> {
        return this.openPageAndGetDataForMessage(seriesInfo.link, createGetSeriesInformationMessage());
    }

    public async getEpisodesForSeason(seasonKey: string, portal: PORTALS): Promise<SeriesEpisodeDto[]> {
        const seriesSeason = this.store.selectSync(getSeriesSeasonByKey, seasonKey)
        console.log(seriesSeason)
        if(seriesSeason) {
            return this.openPageAndGetDataForMessage(seriesSeason.portalLinks[portal], createGetEpisodesForSeasonMessage(seriesSeason.seasonNumber));
        }
        return null
    }

    public async getProvidorLinkForEpisode(episodeKey: string, portal: PORTALS): Promise<ProvidorLink> {
        const episode = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);
        const providor = this.providorService.getCurrentProvidor()?.controllerName;
        const portalLink = episode?.portalLinks[portal][providor];
        if(portalLink) {
            const link = await this.openPageAndGetDataForMessage(portalLink, createGetProvidorLinkForEpisode(episode, providor));
            return {
                providor,
                link
            }
        }
        return null;
    }

    private openPortalUrl(url: string): Observable<BrowserWindow> {

        // const window = this.windowService.openWindow(url);
        const window = this.windowService.openWindow(url, {nodeIntegration: false, visible: true});
        this.store.dispatch(setActivePortalTabIdAction(window.id));
        this.tabController.startAdBlockerForPortal();
        return this.store.selectBehaviour(getActivePortalTabId).pipe(
            switchMap((tabId) => {
                const portalWindow = BrowserWindow.fromId(tabId);
                return fromEvent<void>(portalWindow.webContents,'dom-ready').pipe(
                    debounceTime(1000),
                    first(),
                    mapTo(portalWindow),
                );
            } )
        );
    }

    private async openPageAndGetDataForMessage<T, R>(portalUrl: string, message: Message<T, R>): Promise<R> {
        return new Promise<R>(resolve => {
            const sub = this.openPortalUrl(portalUrl).subscribe(async () => {
                const result = await this.messageService.sendMessageToPortalTab(message);
                this.closePortalWindow();
                console.log(`openPageAndGetDataForMessage for ${message.type}`, result)
                sub.unsubscribe()
                resolve(result);
            });
        });
    }

    private closePortalWindow(): void {
        this.windowService.getPortalWindow()?.close();
        this.tabController.stopPortalAdBlock();
    }
}
