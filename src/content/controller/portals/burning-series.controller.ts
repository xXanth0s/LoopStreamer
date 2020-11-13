import { IPortalController } from './portal.controller.interface';
import { inject, injectable } from 'inversify';
import { simulateEvent } from '../../ustils/simulate-event';
import Providor from '../../../store/models/providor.model';
import { PORTALS } from '../../../store/enums/portals.enum';
import { SeriesEpisodeDto } from '../../../dto/series-episode.dto';
import { SeriesInfoDto } from '../../../dto/series-info.dto';
import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../../shared/services/store.service';
import { getProvidorForName } from '../../../store/selectors/providors.selector';
import SeriesEpisode from '../../../store/models/series-episode.model';
import { PROVIDORS } from '../../../store/enums/providors.enum';
import { Language } from '../../../store/enums/language.enum';
import { LanguageLinkCollection } from '../../../store/models/language-link.model';


@injectable()
export class BurningSeriesController implements IPortalController {

    private readonly portalKey = PORTALS.BS;
    private readonly languageMap: Partial<{ [key in Language]: string }> = {
        [Language.GERMAN]: 'de',
        [Language.ENGLISH]: 'en',
    };

    private readonly activeProvidorSelector = () => document.querySelector('ul.hoster-tabs.top > li.active > a');
    private readonly videoContainerSelector = () => document.querySelector('section > div.hoster-player');

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    getSeasonEpisodes(seasonNumber: number): SeriesEpisodeDto[] {
        const seriesTitle = this.seriesTitleSelector();
        const languages = this.getAvailableLanguages();
        const episodeLinks = [ ...this.seriesSeasonEpisodesSelector() ].map(link => link.href);

        return episodeLinks.map((link, index) => {

            const languageLinkMap = this.transformLinkToLanguagesLinksCollection(link, languages);
            if (!languageLinkMap) {
                return;
            }

            const portalLinks = Object.keys(languageLinkMap).reduce<SeriesEpisodeDto['portalLinks']>((accumulator, language) => {
                return {
                    ...accumulator,
                    [language]: {
                        [PROVIDORS.None]: languageLinkMap[language]
                    }
                };
            }, {});

            return {
                seriesTitle,
                seasonNumber,
                portalLinks,
                episodeNumber: ++index,
                providorLinks: {},
                portal: this.portalKey,
            };
        }).filter(Boolean);
    }

    public async getProvidorLinkForEpisode(episodeInfo: SeriesEpisode, providor: PROVIDORS): Promise<string> {
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
        })
    }

    getSeriesMetaInformation(): SeriesInfoDto {
        const title = this.seriesTitleSelector();
        const description = this.seriesDescriptionSelector();
        const posterHref = this.seriesImageSelector();
        const link = window.location.href;
        const seasonsLinksElements = [ ...this.seriesSeasonSelector() ];
        const seasonsLinks: SeriesInfoDto['seasonsLinks'] = seasonsLinksElements.reduce((obj, link) => {
            return {
                ...obj,
                [link.innerHTML]: {
                    [Language.NONE]: link.href
                }
            }
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

    private readonly languagesSelector = (): Array<HTMLLIElement> => Array.from(document.querySelectorAll('div.language > div > ul > li'));

    private readonly videoUrlSelector = (): HTMLLinkElement => document.querySelector('section > div.hoster-player > a');

    private readonly seriesSeasonSelector = (): NodeListOf<HTMLAnchorElement> => document.querySelector('#seasons').querySelectorAll('a');

    private readonly seriesSeasonEpisodesSelector = (): NodeListOf<HTMLLinkElement> => document.querySelector('.episodes').querySelectorAll('tr > td:nth-child(1) > a');

    private readonly seriesTitleSelector = () => document.querySelector('#sp_left > h2')?.textContent?.trim().split('\n')[0];

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

    private readonly seriesImageSelector = (): string => (document.querySelector('#sp_right > img') as HTMLImageElement)?.src;

    private readonly seriesOverviewListLinkSelector = (): NodeListOf<HTMLAnchorElement> => document.querySelector('#seriesContainer')?.querySelectorAll('a');

    private readonly seriesDescriptionSelector = (): string => document.querySelector('#sp_left > p')?.textContent || '';


    private readonly videoIframeSelector = (): HTMLIFrameElement => document.querySelector('section > div.hoster-player > iframe');

    private getVideoUrl(): string {
        return this.videoUrlSelector()?.href || this.videoIframeSelector()?.src;
    }

    private getAvailableLanguages(): Language[] {
        return this.languagesSelector()
            .map(element => element.dataset.value)
            .map(languageString => this.stringToLanguage(languageString))
            .filter(Boolean);
    }

    private transformLinkToLanguagesLinksCollection(link: string, languages: Language[]): LanguageLinkCollection {
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

    private getLanguageForLink(link: string): Language {
        for (const language of Object.keys(this.languageMap)) {
            const lang = language as Language;
            const regex = this.getLinkRegexForLanguage(lang);
            if (regex.test(link)) {
                return lang;
            }
        }
        return null;
    }

    private getLinkRegexForLanguage(language: Language): RegExp {
        return new RegExp(`([^\/]*${this.languageMap[language]}$)`);
    }

    private stringToLanguage(languageString: string): Language {
        for (const language of Object.keys(this.languageMap)) {
            if (languageString === this.languageMap[language]) {
                return language as Language;
            }
        }

        return null;
    }

    //
    // private getLinksForProvidors(providers: Providor) {
    //
    //     const portalLinks = providors.reduce((obj, providor) => {
    //         const titleElement = getElementWithTitle<HTMLAnchorElement>(episode, providor.names);
    //         if (titleElement) {
    //             obj[providor.controllerName] = titleElement.href;
    //         }
    //
    //         return obj;
    //     }, {})
    // }
}
