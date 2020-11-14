import { IPortalController } from './portal.controller.interface';
import { inject, injectable } from 'inversify';
import { simulateEvent } from '../../ustils/simulate-event';
import Providor from '../../../store/models/providor.model';
import { PORTALS } from '../../../store/enums/portals.enum';
import { SeriesEpisodeDto } from '../../../dto/series-episode.dto';
import { SeriesInfoDto } from '../../../dto/series-info.dto';
import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../../shared/services/store.service';
import { getAllUsedProvidors, getProvidorForName } from '../../../store/selectors/providors.selector';
import SeriesEpisode from '../../../store/models/series-episode.model';
import { PROVIDORS } from '../../../store/enums/providors.enum';
import { LANGUAGE } from '../../../store/enums/language.enum';
import { LanguageLinkCollection } from '../../../store/models/language-link.model';
import { getLinksForProviders } from '../../ustils/dom.utils';
import { ProvidorLink } from '../../../background/models/providor-link.model';
import { SeriesSeasonDto } from '../../../dto/series-season.dto';


@injectable()
export class BurningSeriesController implements IPortalController {

    private readonly portalKey = PORTALS.BS;
    private readonly languageMap: Partial<{ [key in LANGUAGE]: string }> = {
        [LANGUAGE.GERMAN]: 'de',
        [LANGUAGE.ENGLISH]: 'en',
    };

    private readonly activeProvidorSelector = () => document.querySelector('ul.hoster-tabs.top > li.active > a');
    private readonly videoContainerSelector = () => document.querySelector('section > div.hoster-player');
    private readonly seriesDescriptionSelector = (): string => document.querySelector('#sp_left > p')?.textContent || '';
    private readonly videoIframeSelector = (): HTMLIFrameElement => document.querySelector('section > div.hoster-player > iframe');
    private readonly languagesSelector = (): Array<HTMLLIElement> => Array.from(document.querySelectorAll('div.language > div > ul > li'));
    private readonly videoUrlSelector = (): HTMLLinkElement => document.querySelector('section > div.hoster-player > a');
    private readonly seriesSeasonSelector = (): NodeListOf<HTMLAnchorElement> => document.querySelector('#seasons').querySelectorAll('a');
    private readonly activeSeriesSeasonSelector = (): HTMLAnchorElement => document.querySelector('#seasons').querySelector('.active > a');
    private readonly episodesSelector = (): NodeListOf<HTMLElement> => document.querySelector('.episodes').querySelectorAll('tr');
    private readonly seriesTitleSelector = () => document.querySelector('#sp_left > h2')?.textContent?.trim().split('\n')[0];
    private readonly seriesImageSelector = (): string => (document.querySelector('#sp_right > img') as HTMLImageElement)?.src;
    private readonly seriesOverviewListLinkSelector = (): NodeListOf<HTMLAnchorElement> => document.querySelector('#seriesContainer')?.querySelectorAll('a');

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    public async getResolvedProvidorLinkForEpisode(episodeInfo: SeriesEpisode, providor: PROVIDORS): Promise<string> {
        if (this.getActiveProvidor()?.controllerName === providor) {
            const link = this.getVideoUrl();
            if (link) {
                return link;
            }

            if (this.isVideoOpenWithProvidor()) {
                const playButtonElement = this.videoContainerSelector() as HTMLElement;
                simulateEvent(playButtonElement,
                    'click',
                    { pointerX: playButtonElement.clientLeft, pointerY: playButtonElement.clientTop }
                );
                return new Promise((resolve) => {
                    const videoContainer = this.videoContainerSelector();

                    const config = { attributes: false, childList: true, subtree: true };

                    const callback = (mutations: MutationRecord[], observer: MutationObserver) => {
                        const link = this.getVideoUrl();
                        if (link) {
                            resolve(link);
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

    public getAllPortalProviderLinksForEpisode(language: LANGUAGE): ProvidorLink[] {
        const activeLanguage = this.getActiveLanguage();
        if (activeLanguage !== language) {
            return [];
        }

        const providorContainer = this.providorContainerSelector();
        const usedProvidors = this.store.selectSync(getAllUsedProvidors);

        return getLinksForProviders(usedProvidors, providorContainer);
    }

    public getSeriesMetaInformation(): SeriesInfoDto {
        const title = this.seriesTitleSelector();
        const description = this.seriesDescriptionSelector();
        const posterHref = this.seriesImageSelector();
        const link = window.location.href;
        const seasonsLinksElements = [ ...this.seriesSeasonSelector() ];
        const seasonsLinks: SeriesInfoDto['seasonsLinks'] = seasonsLinksElements.reduce((obj, link) => {
            return {
                ...obj,
                [link.innerHTML]: {
                    [LANGUAGE.NONE]: link.href
                }
            };
        }, {});

        return {
            title,
            description,
            posterHref,
            seasonsLinks,
            link,
            portal: this.portalKey,
        };
    }

    public getSeasonInfo(seasonNumber: string): SeriesSeasonDto {
        const activeSeason = this.activeSeriesSeasonSelector();
        if (activeSeason.innerText.trim() !== seasonNumber) {
            return null;
        }

        const seriesTitle = this.seriesTitleSelector();
        const availableLanguages = this.getAvailableLanguages();
        const seasonLink = activeSeason.href;

        const seasonLinks = this.transformLinkToLanguagesLinksCollection(seasonLink, availableLanguages);
        const episodes = this.getSeasonEpisodes(seasonNumber);

        return {
            portal: this.portalKey,
            seriesTitle,
            seasonNumber,
            episodes,
            seasonLinks
        };
    }

    public getSeasonEpisodes(seasonNumber: string): SeriesEpisodeDto[] {
        const seriesTitle = this.seriesTitleSelector();
        const providors = this.store.selectSync(getAllUsedProvidors);
        const activeLanguage = this.getActiveLanguage();
        const episodesHtmlContainer = [ ...this.episodesSelector() ];

        return episodesHtmlContainer.map((episodeHtmlContainer, index) => {
            const portalLinks = getLinksForProviders(providors, episodeHtmlContainer,);

            return {
                seriesTitle,
                seasonNumber,
                portalLinks: {
                    [activeLanguage]: portalLinks,
                },
                episodeNumber: `${++index}`,
                portal: this.portalKey,
            };
        });
    }

    public getAllSeriesInfo(): SeriesInfoDto[] {
        const links = this.seriesOverviewListLinkSelector() || [];
        const collection = [ ...links ];
        return collection.map((linkInfo: HTMLAnchorElement) => {
            const title = linkInfo.text;
            const link = linkInfo.href;

            return {
                link,
                title,
                portal: this.portalKey,
            };
        });
    }

    private readonly providorContainerSelector = (): HTMLElement => document.querySelector('#root > section > ul.hoster-tabs.top');

    isVideoOpenWithProvidor(): Providor | null {
        return this.videoContainerSelector() ? this.getActiveProvidor() : null;
    }

    private getActiveProvidor(): Providor {
        const activeProvidorElement = this.activeProvidorSelector() as HTMLElement;
        if (activeProvidorElement) {
            const providorName = activeProvidorElement.textContent.trim();
            return this.store.selectSync(getProvidorForName, providorName);
        }

        return null;
    }

    private getVideoUrl(): string {
        return this.videoUrlSelector()?.href || this.videoIframeSelector()?.src;
    }

    private getAvailableLanguages(): LANGUAGE[] {
        return this.languagesSelector()
            .map(element => element.dataset.value)
            .map(languageString => this.stringToLanguage(languageString))
            .filter(Boolean);
    }

    private transformLinkToLanguagesLinksCollection(link: string, languages: LANGUAGE[]): LanguageLinkCollection {
        const sourceLanguage = this.getLanguageForLink(link);
        if (!sourceLanguage) {
            return null;
        }

        const regex = this.getLinkRegexForLanguage(sourceLanguage);

        return languages.reduce((finalLinks, language) => {
            const languageLink = link.replace(regex, this.languageMap[language]);
            return {
                ...finalLinks,
                [language]: languageLink,
            };
        }, {});
    }

    private getLanguageForLink(link: string): LANGUAGE {
        for (const language of Object.keys(this.languageMap)) {
            const lang = language as LANGUAGE;
            const regex = this.getLinkRegexForLanguage(lang);
            if (regex.test(link)) {
                return lang;
            }
        }
        return null;
    }

    private getLinkRegexForLanguage(language: LANGUAGE): RegExp {
        return new RegExp(`([^\/]*${this.languageMap[language]}$)`);
    }

    private stringToLanguage(languageString: string): LANGUAGE {
        for (const language of Object.keys(this.languageMap)) {
            if (languageString === this.languageMap[language]) {
                return language as LANGUAGE;
            }
        }

        return null;
    }

    private getActiveLanguage(): LANGUAGE {
        const languageElement = this.languagesSelector().find(link => link.classList.contains('selected'));
        if (!languageElement) {
            return LANGUAGE.NONE;
        }

        return this.stringToLanguage(languageElement.dataset.value);
    }
}
