import {IPortalController} from './portal.controller.interface';
import {inject, injectable} from 'inversify';
import {CONTENT_TYPES} from '../../container/CONTENT_TYPES';
import {ProvidorService} from '../../services/providor.service';
import {simulateEvent} from '../../ustils/simulate-event';
import Providor from '../../../store/models/providor.model';
import SeriesEpisodeInfo from '../../../store/models/series-episode-info.model';
import Series from '../../../store/models/series.model';

@injectable()
export class BurningSeriesController implements IPortalController {

    private readonly activeProvidorSelector = () => document.querySelector('ul.hoster-tabs.top > li.active > a');
    private readonly videoContainerSelector = () => document.querySelector('section > div.hoster-player');
    private readonly videoUrlSelector = () => document.querySelector('section > div.hoster-player > a');
    private readonly seriesSeasonSelector = () => document.querySelector("#seasons > ul > li.active");
    private readonly seriesEpisodeSelector = () => document.querySelector("#episodes > ul > li.active");
    private readonly seriesTitleSelector = () => document.querySelector("#sp_left > h2");
    private readonly seriesImageSelector = (): HTMLImageElement => document.querySelector("#sp_right > img");
    private readonly episodeLinksSelector = (): NodeListOf<HTMLElement> => document.querySelectorAll("div.epiInfo");

    constructor(@inject(CONTENT_TYPES.ProvidorService) private readonly providorService: ProvidorService) {
    }

    getLinkForOpenVideo(): boolean {
        if (this.isVideoOpenWithProvidor()) {
            const playButtonElement = this.videoContainerSelector() as HTMLElement;
            simulateEvent(playButtonElement,
                'click',
                {pointerX: playButtonElement.clientTop, pointerY: playButtonElement.clientLeft}
            );
            return true;
        }

        return false;
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

    public async getSeriesInfo(withVideoLink: boolean): Promise<Series> {
        const title = this.seriesTitleSelector()?.textContent?.trim().split('\n')[0];
        const imageHref = this.seriesImageSelector()?.src;
        const key = this.getSeriesKey();
        const lastEpisodeWatched = await this.getEpisodeInfo(withVideoLink);

        return {
            title,
            imageHref,
            key,
            lastEpisodeWatched
        }
    }

    public async getEpisodeInfo(withVideoLink: boolean): Promise<SeriesEpisodeInfo> {
        const season = +this.seriesSeasonSelector()?.textContent;
        const episode = +this.seriesEpisodeSelector()?.textContent;
        if (season && episode) {
            const portalHref = window.location.href;
            const seriesKey = this.getSeriesKey();
            const providorHref = withVideoLink ? await this.getLinkForActiveVideo() : '';
            return {
                season,
                episode,
                portalHref,
                providorHref,
                seriesKey,
                hasNextEpisode: this.hasNextEpisode(),
                hasPreviousEpisode: this.hasPreviousEpisode(),
            }
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
                {pointerX: playButtonElement.clientTop, pointerY: playButtonElement.clientLeft}
            );
            return new Promise((resolve) => {
                const videoContainer = this.videoContainerSelector();

                const config = {attributes: false, childList: true, subtree: true};

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

    private getSeriesKey(): string {
        const title = this.seriesTitleSelector()?.textContent?.trim().split('\n')[0];
        return title?.toLowerCase().replace(' ', '-');
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
}
