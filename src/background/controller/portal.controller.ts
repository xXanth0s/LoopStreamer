import { inject, injectable } from 'inversify';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { catchError, debounceTime, filter, first, takeUntil, tap } from 'rxjs/operators';
import {
    createGetAllSeriesFromPortalMessage,
    createGetDetailedSeriesInformationMessage,
    createGetEpisodesForSeasonMessage,
    createGetProvidorLinkForEpisode
} from '../../browserMessages/messages/portal.messages';
import { getPortalForKey } from '../../store/selectors/portals.selector';
import { WindowService } from '../services/window.service';
import { fromEvent, Observable } from 'rxjs';
import { PORTALS } from '../../store/enums/portals.enum';
import {
    addAsyncInteractionAction,
    removeAsyncInteractionAction,
    resetControlStateAction,
    setActivePortalAction,
    setWindowIdForWindowTypeAction
} from '../../store/reducers/control-state.reducer';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { Message } from '../../browserMessages/messages/message.interface';
import { getSeriesSeasonByKey } from '../../store/selectors/series-season.selector';
import { getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';
import { ProvidorLink } from '../models/providor-link.model';
import { BrowserWindow } from 'electron';
import { WindowController } from './window.controller';
import { finalizeWithValue, waitTillPageLoadFinished } from '../../utils/rxjs.util';
import { WindowType } from '../../store/enums/window-type.enum';
import Series from '../../store/models/series.model';
import { generateAsyncInteraction } from '../../store/store/async-interaction.util';
import { AsyncInteractionType } from '../../store/enums/async-interaction-type.enum';
import { PROVIDORS } from '../../store/enums/providors.enum';
import { AsyncInteraction } from '../../store/models/async-interaction.model';
import { Logger } from '../../shared/services/logger';
import {
    getLinkForSeriesAndPortal,
    getLinkForSeriesSeasonAndPortal
} from '../../store/selectors/línk.selector';

@injectable()
export class PortalController {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService,
                @inject(BACKGROUND_TYPES.WindowController) private readonly windowController: WindowController) {
    }

    public async getAllSeriesFromPortal(portalKey: PORTALS): Promise<SeriesInfoDto[]> {
        const portal = this.store.selectSync(getPortalForKey, portalKey);

        const asyncInteractionModel = generateAsyncInteraction(AsyncInteractionType.PORTAL_GET_ALL_SERIES, { portalKey });

        return this.openPageAndGetDataForMessage(
            portal.seriesListUrl,
            portalKey,
            createGetAllSeriesFromPortalMessage(),
            asyncInteractionModel
        );
    }

    public async getDetailedSeriesInformation(seriesKey: Series['key'], portalKey: PORTALS): Promise<SeriesInfoDto> {
        const link = this.store.selectSync(getLinkForSeriesAndPortal, seriesKey, portalKey);
        if (!link) {
            Logger.error(`[PortalController->getDetailedSeriesInformation] tried to load link info for series ${seriesKey} and ${portalKey}, but no valid data found. Data found:`);
        }

        const asyncInteractionModel = generateAsyncInteraction(AsyncInteractionType.PORTAL_GET_DETAILED_SERIES, {
            seriesKey,
            portalKey
        });


        return this.openPageAndGetDataForMessage(
            link.href,
            portalKey,
            createGetDetailedSeriesInformationMessage(),
            asyncInteractionModel
        );
    }

    public async getEpisodesForSeason(seasonKey: string, portalKey: PORTALS): Promise<SeriesEpisodeDto[]> {
        const seriesSeason = this.store.selectSync(getSeriesSeasonByKey, seasonKey);
        const link = this.store.selectSync(getLinkForSeriesSeasonAndPortal, seasonKey, portalKey);
        if (!link || !seriesSeason) {
            console.error(`[PortalController -> getEpisodesForSeason] tried to load episode info for season ${seasonKey} and ${portalKey}, but no valid data found. Data found:`, seriesSeason);
        }

        const asyncInteractionModel = generateAsyncInteraction(AsyncInteractionType.PORTAL_GET_SEASON_EPISODES, {
            seasonKey,
            portalKey
        });


        return this.openPageAndGetDataForMessage(
            link.href,
            portalKey,
            createGetEpisodesForSeasonMessage(+seriesSeason.seasonNumber),
            asyncInteractionModel
        );
    }

    public async getProvidorLinkForEpisode(episodeKey: string, portalKey: PORTALS, providor: PROVIDORS): Promise<ProvidorLink> {
        const episode = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);
        const portalLink = episode?.portalLinks[portalKey][providor];

        if (!portalLink) {
            console.error(`[PortalController->getProvidorLinkForEpisode] tried to load portal links for episode ${episode} and ${portalKey}, but no valid data found.`);
            return null;
        }

        const asyncInteractionModel = generateAsyncInteraction(AsyncInteractionType.PORTAL_GET_EPISODE_INFO, {
            episodeKey,
            portalKey
        });

        const link = await this.openPageAndGetDataForMessage(portalLink, portalKey, createGetProvidorLinkForEpisode(episode, providor), asyncInteractionModel);

        return {
            providor,
            link
        };
    }

    private openPortalUrl(url: string, portalKey: PORTALS): Observable<BrowserWindow> {
        const portal = this.store.selectSync(getPortalForKey, portalKey);
        return this.windowController.openLinkForWebsite(portal, url).pipe(
            takeUntil(this.store.playerHasStopped()),
            waitTillPageLoadFinished(),
            tap(() => this.store.dispatch(setActivePortalAction(portalKey))),
            debounceTime(1000),
            finalizeWithValue((window: BrowserWindow) => this.windowService.closeWindow(window.id, true)),
        );
    }

    private async openPageAndGetDataForMessage<T, R>(portalUrl: string, portalKey: PORTALS, message: Message<T, R>, asyncInteraction: AsyncInteraction): Promise<R> {
        this.store.dispatch(addAsyncInteractionAction(asyncInteraction));

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
                    first()
                ).subscribe(() => this.store.dispatch(resetControlStateAction()));

                try {
                    const result = await this.messageService.sendMessageToBrowserWindow(window.id, message);
                    resolve(result);
                } catch (err) {
                    Logger.error(`[PortalController->openPageAndGetDataForMessage] error while sending message ${message}`, err);
                } finally {
                    this.store.dispatch(setWindowIdForWindowTypeAction({
                        windowId: null,
                        windowType: WindowType.PORTAL
                    }));
                    this.store.dispatch(removeAsyncInteractionAction(asyncInteraction.key));
                    sub.unsubscribe();
                    closeSub.unsubscribe();
                }
            });
        });
    }
}
