import { inject, injectable } from 'inversify';
import { catchError, debounceTime, filter, first, takeUntil, } from 'rxjs/operators';
import { fromEvent, Observable } from 'rxjs';
import { BrowserWindow } from 'electron';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import {
    createGetAllProvidorLinksForEpisodeMessage,
    createGetAllSeriesFromPortalMessage,
    createGetDetailedSeriesInformationMessage,
    createGetResolvedProvidorLinkForEpisodeMessage,
    createGetSeasonInfoMessage,
} from '../../browserMessages/messages/portal.messages';
import { getPortalForKey } from '../../store/selectors/portals.selector';
import { WindowService } from '../services/window.service';
import { PORTALS } from '../../store/enums/portals.enum';
import { resetControlStateAction, setWindowIdForWindowTypeAction } from '../../store/reducers/control-state.reducer';
import { PortalSeriesInfoDto } from '../../dto/portal-series-info.dto';
import { Message } from '../../browserMessages/messages/message.interface';
import { getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';
import { ProvidorLink } from '../models/providor-link.model';
import { WindowController } from './window.controller';
import { finalizeWithValue, waitTillPageLoadFinished } from '../../utils/rxjs.util';
import { WindowType } from '../../store/enums/window-type.enum';
import Series from '../../store/models/series.model';
import { PROVIDORS } from '../../store/enums/providors.enum';
import { Logger } from '../../shared/services/logger';
import { getLinkForSeriesAndPortal, getLinksByKeys } from '../../store/selectors/línk.selector';
import SeriesEpisode from '../../store/models/series-episode.model';
import { LANGUAGE } from '../../store/enums/language.enum';
import { PortalSeriesSeasonDto } from '../../dto/portal-series-season.dto';
import { LinkModel } from '../../store/models/link.model';

@injectable()
export class PortalController {
    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService,
                @inject(BACKGROUND_TYPES.WindowController) private readonly windowController: WindowController) {
    }

    public async getAllSeriesFromPortal(portalKey: PORTALS): Promise<PortalSeriesInfoDto[]> {
        const portal = this.store.selectSync(getPortalForKey, portalKey);

        return this.openPageAndGetDataForMessage(
            portal.seriesListUrl,
            portalKey,
            createGetAllSeriesFromPortalMessage(portalKey),
        );
    }

    public async getDetailedSeriesInformation(seriesKey: Series['key'], portalKey: PORTALS): Promise<PortalSeriesInfoDto> {
        const link = this.store.selectSync(getLinkForSeriesAndPortal, seriesKey, portalKey);
        if (!link) {
            Logger.error(`[PortalController->getDetailedSeriesInformation] tried to load link info for series ${seriesKey} and ${portalKey}, but no valid data found. Data found:`);
        }

        return this.openPageAndGetDataForMessage(
            link.href,
            portalKey,
            createGetDetailedSeriesInformationMessage(portalKey),
        );
    }

    public async getSeasonInfoForLink(link: LinkModel, seasonNumber: string): Promise<PortalSeriesSeasonDto> {
        return this.openPageAndGetDataForMessage(
            link.href,
            link.portal,
            createGetSeasonInfoMessage(seasonNumber, link.portal),
        );
    }

    public getAllProviderPortalLinksForEpisode(episodeKey: SeriesEpisode['key'],
                                               portalKey: PORTALS,
                                               language: LANGUAGE): Promise<ProvidorLink[]> {
        const episode = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);
        const links = this.store.selectSync(getLinksByKeys, episode.portalLinks);
        const portalLink = links.find(link => link.portal === portalKey && link.providor === PROVIDORS.None);

        if (!portalLink) {
            return null;
        }

        return this.openPageAndGetDataForMessage(
            portalLink.href,
            portalKey,
            createGetAllProvidorLinksForEpisodeMessage(language, portalKey),
        );
    }

    public async getProvidorLinkForEpisode(episodeKey: string, portalKey: PORTALS, providor: PROVIDORS, language: LANGUAGE): Promise<ProvidorLink> {
        const episode = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);
        const links = this.store.selectSync(getLinksByKeys, episode.portalLinks);
        const portalLink = links.find(link => link.portal === portalKey
            && link.providor === providor
            && link.language === language);

        if (!portalLink) {
            return null;
        }

        const link = await this.openPageAndGetDataForMessage(
            portalLink.href,
            portalKey,
            createGetResolvedProvidorLinkForEpisodeMessage(episode, providor, portalKey),
        );
        return {
            providor,
            link,
        };
    }

    private openPortalUrl(url: string, portalKey: PORTALS): Observable<BrowserWindow> {
        const portal = this.store.selectSync(getPortalForKey, portalKey);
        return this.windowController.openLinkForWebsite(portal, url).pipe(
            takeUntil(this.store.playerHasStopped()),
            waitTillPageLoadFinished(),
            debounceTime(1000),
            finalizeWithValue((window: BrowserWindow) => {
                console.log('finalizeWithValue and url', url);
                this.windowService.closeWindow(window.id, true);
            }),
        );
    }

    private async openPageAndGetDataForMessage<T, R>(portalUrl: string, portalKey: PORTALS, message: Message<T, R>): Promise<R> {
        return new Promise<R>(resolve => {
            const sub = this.openPortalUrl(portalUrl, portalKey).pipe(
                catchError(err => {
                    Logger.error(`[PortalController->openPageAndGetDataForMessage] error for message ${message} while opening url ${portalUrl} for portal ${portalKey}`, err);
                    this.store.dispatch(resetControlStateAction());
                    return null;
                }),
                filter<BrowserWindow>(Boolean),
            ).subscribe(async (window) => {
                const closeSub = fromEvent(window, 'close').pipe(
                    first(),
                    takeUntil(this.store.playerHasStopped()),
                ).subscribe(() => {
                    this.store.dispatch(resetControlStateAction());
                });

                try {
                    const result = await this.messageService.sendMessageToBrowserWindow(window.id, message);
                    closeSub.unsubscribe();
                    resolve(result);
                } catch (err) {
                    Logger.error(`[PortalController->openPageAndGetDataForMessage] error while sending message ${message}`, err);
                } finally {
                    this.store.dispatch(setWindowIdForWindowTypeAction({
                        windowId: null,
                        windowType: WindowType.PORTAL,
                    }));
                    sub.unsubscribe();
                }
            });
        });
    }
}
