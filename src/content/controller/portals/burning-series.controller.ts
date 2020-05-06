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
import { getKeyForSeriesTitle } from '../../../store/utils/key.utils';

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
    private readonly getActiveSeasonSelector = (): number => +document.querySelector('#seasons > ul > li.s1.active')?.innerHTML;

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

    public async getEpisodeInfo(withVideoLink: boolean): Promise<SeriesEpisodeDto> {
        const seasonNumber = +this.seriesActiveSeasonSelector()?.textContent;
        const epdisodeNumber = +this.seriesEpisodeSelector()?.textContent;
        if (seasonNumber && epdisodeNumber) {
            const portalHref = window.location.href;
            const seriesKey = getKeyForSeriesTitle(this.seriesTitleSelector());
            const providorHref = withVideoLink ? await this.getLinkForActiveVideo() : '';
            let providorLinks = {};
            const providor = await this.providorService.getCurrentProvidor();
            if (providorHref) {
                providorLinks = { [providor.controllerName]: providorHref };
            }
            //
            // return {
            //     seasonNumber,
            //     epdisodeNumber,
            //     seriesKey,
            //     providorLinks,
            //     portalLinks: { [providor.controllerName]: portalHref },
            // }
        }

        return null;
    }

    public async getLinkForActiveVideo(): Promise<string> {
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

        return '';
    }

    public async getLinkForEpisodeWithOffset(offset: number): Promise<string> {
        const links = await this.getHTMLLinksForEpispdeWithOffset(offset);
        let link: string = '';
        await this.providorService.reset();
        do {
            const providor = await this.providorService.getNextProvidor();
            if (!providor) {
                break;
            }

            const linkNode = links
                .find(node => {
                    return providor.names.some(name => {
                        return node.href.toLowerCase().includes(name.toLowerCase())
                    })
                });
            link = linkNode?.href;
        } while (!link);

        return link;
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

    private getHTMLLinksForEpispdeWithOffset(offset: number): HTMLLinkElement[] {
        let result: HTMLLinkElement[] = [];
        if (this.hasNextEpisode()) {
            const currentEpisode = +this.seriesEpisodeSelector().textContent;
            const episodeLinks = Array.from(this.episodeLinksSelector());
            result = episodeLinks
                .filter(node => node.classList.contains(`${currentEpisode + offset}`))
                .flatMap(node => Array.from(node.querySelectorAll<HTMLLinkElement>('a')));
        }

        return result;
    }

    private hasNextEpisode(): boolean {
        return Boolean(this.seriesEpisodeSelector().nextElementSibling);
    }

    private hasPreviousEpisode(): boolean {
        return Boolean(this.seriesEpisodeSelector().previousElementSibling);
    }

    private mapTitleToKey(title: string): string {
        return title?.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s/g, "-");
    }

    getSeasonEpisodes(seasonNumber: number): SeriesEpisodeDto[] {
        const activeSeason = this.getActiveSeasonSelector();
        let episodeDtos = [];
        if (activeSeason === seasonNumber) {
            const seriesTitle = this.seriesTitleSelector();
            const providors = this.store.selectSync(getAllUsedProvidors);
            const episodes = [ ...this.seriesSeasonEpisodesSelector() ];
            episodeDtos = episodes.map((episode, index) => {
                const portalLinks = providors.reduce((obj, providor) => {
                    const titleElement = this.getElementWithTitle<HTMLAnchorElement>(episode, providor.names);
                    if(titleElement) {
                        obj[providor.controllerName] = titleElement;
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
        }
        return episodeDtos;
    }

    getSeriesMetaInformation(): SeriesInfoDto {
        const title = this.seriesTitleSelector();
        const posterHref = this.seriesImageSelector()
        const link = window.location.href;
        const seasonsLinksElements = [ ...this.seriesSeasonSelector() ];
        const seasonsLinks = seasonsLinksElements.reduce((obj, link) => {
            obj[link.innerHTML] = link.href;
            return obj;
        }, {})

        return {
            title,
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

    getLinkForOpenVideo(): boolean {
        return false;
    }
}
