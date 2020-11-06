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
import { getSeriesByKey } from '../../store/selectors/series.selector';
import { generateAsyncInteraction } from '../../store/store/async-interaction.util';
import { AsyncInteractionType } from '../../store/enums/async-interaction-type.enum';
import { PROVIDORS } from '../../store/enums/providors.enum';

@injectable()
export class PortalController {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService,
                @inject(BACKGROUND_TYPES.WindowController) private readonly windowController: WindowController) {
    }

    public async getAllSeriesFromPortal(portalKey: PORTALS): Promise<SeriesInfoDto[]> {
        const portal = this.store.selectSync(getPortalForKey, portalKey);
        let seriesInfos = [];
        const asyncInteractionModel = generateAsyncInteraction(AsyncInteractionType.PORTAL_GET_ALL_SERIES, { portalKey });
        this.store.dispatch(addAsyncInteractionAction(asyncInteractionModel));

        try {
            seriesInfos = await this.openPageAndGetDataForMessage(portal.seriesListUrl, portalKey, createGetAllSeriesFromPortalMessage());
        } catch (e) {
            console.error('[PortalController -> getAllSeriesFromPortal]', e);
        } finally {
            this.store.dispatch(removeAsyncInteractionAction(asyncInteractionModel.key));
        }
        return seriesInfos;
    }

    public async getDetailedSeriesInformation(seriesKey: Series['key'], portalKey: PORTALS): Promise<SeriesInfoDto> {
        const seriesInfo = this.store.selectSync(getSeriesByKey, seriesKey);
        if (!seriesInfo?.portalLinks[portalKey]) {
            console.error(`[PortalController->getDetailedSeriesInformation] tried to load detailed info for series ${seriesKey} and ${portalKey}, but no valid data found. Data found:`, seriesInfo);
        }

        let detailedSeriesInfo: SeriesInfoDto = null;
        const asyncInteractionModel = generateAsyncInteraction(AsyncInteractionType.PORTAL_GET_DETAILED_SERIES, {
            seriesKey,
            portalKey
        });
        this.store.dispatch(addAsyncInteractionAction(asyncInteractionModel));
        try {
            detailedSeriesInfo = await this.openPageAndGetDataForMessage(seriesInfo.portalLinks[portalKey], portalKey, createGetDetailedSeriesInformationMessage());
        } catch (e) {
            console.error('[PortalController->getDetailedSeriesInformation]', e);
        } finally {
            this.store.dispatch(removeAsyncInteractionAction(asyncInteractionModel.key));
        }

        return detailedSeriesInfo;
    }

    public async getEpisodesForSeason(seasonKey: string, portalKey: PORTALS): Promise<SeriesEpisodeDto[]> {
        const seriesSeason = this.store.selectSync(getSeriesSeasonByKey, seasonKey);
        if (!seriesSeason?.portalLinks[portalKey]) {
            console.error(`[PortalController -> getEpisodesForSeason] tried to load episode info for season ${seasonKey} and ${portalKey}, but no valid data found. Data found:`, seriesSeason);
        }

        let seriesEpisodes: SeriesEpisodeDto[] = [];
        const asyncInteractionModel = generateAsyncInteraction(AsyncInteractionType.PORTAL_GET_SEASON_EPISODES, {
            seasonKey,
            portalKey
        });
        this.store.dispatch(addAsyncInteractionAction(asyncInteractionModel));
        try {
            seriesEpisodes = await this.openPageAndGetDataForMessage(seriesSeason.portalLinks[portalKey], portalKey, createGetEpisodesForSeasonMessage(seriesSeason.seasonNumber));
        } catch (e) {
            console.error('[PortalController -> getEpisodesForSeason]', e);
        } finally {
            this.store.dispatch(removeAsyncInteractionAction(asyncInteractionModel.key));
        }

        return seriesEpisodes;
    }

    public async getProvidorLinkForEpisode(episodeKey: string, portalKey: PORTALS, providor: PROVIDORS): Promise<ProvidorLink> {
        const episode = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);
        const portalLink = episode?.portalLinks[portalKey][providor];

        if (!portalLink) {
            console.error(`[PortalController -> getProvidorLinkForEpisode] tried to load portal links for episode ${episode} and ${portalKey}, but no valid data found.`);
        }

        let link: string = null;
        const asyncInteractionModel = generateAsyncInteraction(AsyncInteractionType.PORTAL_GET_EPISODE_INFO, {
            episodeKey,
            portalKey
        });
        this.store.dispatch(addAsyncInteractionAction(asyncInteractionModel));
        try {
            link = await this.openPageAndGetDataForMessage(portalLink, portalKey, createGetProvidorLinkForEpisode(episode, providor));
        } catch (e) {
            console.error('[PortalController -> getProvidorLinkForEpisode]', e);
        } finally {
            this.store.dispatch(removeAsyncInteractionAction(asyncInteractionModel.key));
        }

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

    private async openPageAndGetDataForMessage<T, R>(portalUrl: string, portalKey: PORTALS, message: Message<T, R>): Promise<R> {
        return new Promise<R>((resolve, reject) => {
            const sub = this.openPortalUrl(portalUrl, portalKey).pipe(
                catchError(err => {
                    reject(err);
                    return null;
                }),
                filter<BrowserWindow>(Boolean),
            ).subscribe(async (window) => {
                let result: R;

                try {
                    result = await this.messageService.sendMessageToBrowserWindow(window.id, message);
                } catch (e) {
                    reject(e);
                }

                resolve(result);

                this.store.dispatch(setWindowIdForWindowTypeAction({ windowId: null, windowType: WindowType.PORTAL }));
                sub.unsubscribe();

                // return null, when window gets closed, so outer function gets notified about it
                fromEvent(window, 'close').pipe(
                    first()
                ).subscribe(() => resolve(null));
            });
        });
    }
}
