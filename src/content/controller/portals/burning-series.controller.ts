import { IPortalController } from './portal.controller.interface';
import { inject, injectable } from 'inversify';
import { CONTENT_TYPES } from '../../container/CONTENT_TYPES';
import { ProvidorService } from '../../services/providor.service';
import { simulateEvent } from '../../ustils/simulate-event';
import Providor from '../../../store/models/providor.model';
import { SeriesMetaInfoDto } from '../../../dto/series-meta-info.dto';
import { PORTALS } from '../../../store/enums/portals.enum';
import { SeriesEpisodeDto } from '../../../dto/series-episode.dto';
import { SeriesInfoDto } from '../../../dto/series-info.dto';
import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../../shared/services/store.service';
import { getAllUsedProvidors } from '../../../store/selectors/providors.selector';
import SeriesEpisode from '../../../store/models/series-episode.model';
import { PROVIDORS } from '../../../store/enums/providors.enum';

@injectable()
export class BurningSeriesController implements IPortalController {

    private readonly portalKey = PORTALS.BS;

    private readonly activeProvidorSelector = () => document.querySelector('ul.hoster-tabs.top > li.active > a');
    private readonly videoContainerSelector = () => document.querySelector('section > div.hoster-player');
    private readonly videoUrlSelector = () => document.querySelector('section > div.hoster-player > a');
    private readonly seriesActiveSeasonSelector = () => document.querySelector('#seasons > ul > li.active');
    private readonly seriesSeasonSelector = (): NodeListOf<HTMLAnchorElement> => document.querySelector("#seasons").querySelectorAll("a")
    private readonly seriesEpisodeSelector = () => document.querySelector('#episodes > ul > li');
    private readonly seriesSeasonEpisodesSelector = (): NodeListOf<HTMLTableRowElement> => document.querySelector('.episodes').querySelectorAll('tr');
    private readonly seriesTitleSelector = () => document.querySelector("#sp_left > h2")?.textContent?.trim().split('\n')[0];
    private readonly seriesImageSelector = (): string => (document.querySelector("#sp_right > img") as HTMLImageElement)?.src;
    private readonly episodeLinksSelector = (): NodeListOf<HTMLElement> => document.querySelectorAll('div.epiInfo');
    private readonly seriesOverviewListLinkSelector = (): NodeListOf<HTMLAnchorElement> => document.querySelector("#seriesContainer")?.querySelectorAll("a");
    private readonly seriesDescriptionSelector = (): string => document.querySelector("#sp_left > p")?.textContent || '';

    constructor(@inject(CONTENT_TYPES.ProvidorService) private readonly providorService: ProvidorService,
                @inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    isVideoOpenWithProvidor(): Providor | null {
        return this.videoContainerSelector() ? this.getActiveProvidor() : null;
    }

    private getActiveProvidor(): Providor {
        const activeProvidorElement = this.activeProvidorSelector() as HTMLElement;
        if (activeProvidorElement) {
            const providorName = activeProvidorElement.textContent.trim();
            return this.providorService.getProvidorForName(providorName);
        }

        return null;
    }

    public getAllSeriesInfo(): SeriesMetaInfoDto[] {
        const links = this.seriesOverviewListLinkSelector();
        const collection = [ ...links ];
        return collection.map((linkInfo: HTMLAnchorElement) => {
            const title = linkInfo.text;
            const link = linkInfo.href;

            return {
                link,
                title,
                portal: this.portalKey,
            }
        })
    }

    getSeasonEpisodes(seasonNumber: number): SeriesEpisodeDto[] {
        let episodeDtos = [];
        const seriesTitle = this.seriesTitleSelector();
        const providors = this.store.selectSync(getAllUsedProvidors);
        const episodes = [ ...this.seriesSeasonEpisodesSelector() ];
        episodeDtos = episodes.map((episode, index) => {
            const portalLinks = providors.reduce((obj, providor) => {
                const titleElement = this.getElementWithTitle<HTMLAnchorElement>(episode, providor.names);
                if (titleElement) {
                    obj[providor.controllerName] = titleElement.href;
                }

                return obj;
            }, {})

            return {
                seriesTitle,
                seasonNumber,
                portalLinks,
                epdisodeNumber: ++index,
                providorLinks: {},
                portal: this.portalKey,
            }
        })
        return episodeDtos;
    }

    getSeriesMetaInformation(): SeriesInfoDto {
        const title = this.seriesTitleSelector();
        const description = this.seriesDescriptionSelector();
        const posterHref = this.seriesImageSelector()
        const link = window.location.href;
        const seasonsLinksElements = [ ...this.seriesSeasonSelector() ];
        const seasonsLinks = seasonsLinksElements.reduce((obj, link) => {
            obj[link.innerHTML] = link.href;
            return obj;
        }, {})

        return {
            title,
            description,
            posterHref,
            seasonsLinks,
            link,
            portal: this.portalKey,
        }
    }

    private getElementWithTitle<T extends Element>(element: Element, titles: string[]): T {
        let result: T = null;
        for (const title of titles) {
            result = element.querySelector(`[title^="${title}" i]`);
        }

        return result;
    }

    public async getProvidorLinkForEpisode(episodeInfo: SeriesEpisode, providor: PROVIDORS): Promise<string> {
        // return timer(100000).pipe(
        //     mapTo('')
        // ).toPromise();
        if (this.getActiveProvidor()?.controllerName === providor) {
            const link = this.videoUrlSelector() as HTMLLinkElement;
            if (link) {
                return link.href;
            }

            if (this.isVideoOpenWithProvidor()) {
                const playButtonElement = this.videoContainerSelector() as HTMLElement;
                simulateEvent(playButtonElement,
                    'click',
                    { pointerX: playButtonElement.clientTop, pointerY: playButtonElement.clientLeft }
                );
                return new Promise((resolve) => {
                    const videoContainer = this.videoContainerSelector();

                    const config = { attributes: false, childList: true, subtree: true };

                    const callback = (mutations: MutationRecord[], observer: MutationObserver) => {
                        const link = this.videoUrlSelector() as HTMLLinkElement;
                        if (link) {
                            resolve(link.href);
                            observer.disconnect();
                        }
                    };

                    const observer = new MutationObserver(callback);
                    observer.observe(videoContainer, config);
                });
            }
        } else {
            return '';
        }
    }
}
