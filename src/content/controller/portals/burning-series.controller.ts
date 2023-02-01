import { inject, injectable } from 'inversify';
import { IPortalController } from './portal.controller.interface';
import { Providor } from '../../../store/models/providor.model';
import { PORTALS } from '../../../store/enums/portals.enum';
import { PortalSeriesEpisodeDto } from '../../../dto/portal-series-episode.dto';
import { PortalSeriesInfoDto } from '../../../dto/portal-series-info.dto';
import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../../shared/services/store.service';
import { getAllUsedProvidors, getProvidorForName } from '../../../store/selectors/providors.selector';
import { SeriesEpisode } from '../../../store/models/series-episode.model';
import { PROVIDORS } from '../../../store/enums/providors.enum';
import { LANGUAGE } from '../../../store/enums/language.enum';
import { LanguageLinkCollection } from '../../../store/models/language-link.model';
import { getLinksForProviders, getLinkWithText } from '../../ustils/dom.utils';
import { ProvidorLink } from '../../../background/models/providor-link.model';
import { PortalSeriesSeasonDto } from '../../../dto/portal-series-season.dto';
import { MessageService } from '../../../shared/services/message.service';
import { createExecuteScriptMessage } from '../../../browserMessages/messages/background.messages';
import { getSeriesByKey } from '../../../store/selectors/series.selector';

@injectable()
export class BurningSeriesController implements IPortalController {
    private readonly portalKey = PORTALS.BS;
    private readonly languageMap: Partial<{ [key in LANGUAGE]: string }> = {
        [LANGUAGE.GERMAN]: 'de',
        [LANGUAGE.ENGLISH]: 'en',
        [LANGUAGE.ENGLISH_GERMAN_SUB]: 'des',
        [LANGUAGE.NONE]: '',
    };

    /* eslint-disable max-len */
    private readonly activeProvidorSelector = () => document.querySelector('ul.hoster-tabs.top > li.active > a');
    private readonly videoContainerSelector = () => document.querySelector('section > div.hoster-player');
    private readonly videoIframeSelector = (): HTMLIFrameElement => document.querySelector('section > div.hoster-player > iframe');
    private readonly languagesSelector = (): Array<HTMLLIElement> => Array.from(document.querySelectorAll('div.language > div > ul > li'));
    private readonly videoUrlSelector = (): HTMLLinkElement => document.querySelector('section > div.hoster-player > a');
    private readonly seriesSeasonSelector = (): NodeListOf<HTMLAnchorElement> => document.querySelector('#seasons').querySelectorAll('a');
    private readonly activeSeriesSeasonSelector = (): HTMLAnchorElement => document.querySelector('#seasons').querySelector('.active > a');
    private readonly episodesSelector = (): NodeListOf<HTMLElement> => document.querySelector('.episodes').querySelectorAll('tr');
    private readonly providerContainerSelector = (): HTMLElement => document.querySelector('#root > section > ul.hoster-tabs.top');

    /* eslint-enable max-len */

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService) {
    }

    public async getResolvedProvidorLinkForEpisode(episodeInfo: SeriesEpisode,
                                                   providor: PROVIDORS): Promise<string> {
        if (this.getActiveProvidor()?.controllerName !== providor) {
            return '';
        }

        const videoUrl = this.getVideoUrl();
        if (videoUrl) {
            return videoUrl;
        }
        if (this.isVideoOpenWithProvidor()) {
            const playButtonElement = this.videoContainerSelector() as HTMLElement;
            this.videoContainerSelector.toString();
            const scriptToBeExecuted = `window.simulateEvent((${this.videoContainerSelector.toString()})(),
                    'click',
                    { pointerX: ${playButtonElement.clientLeft}, pointerY: ${playButtonElement.clientTop} }
                )`;
            this.messageService.sendMessageToBackground(createExecuteScriptMessage(scriptToBeExecuted));
            return new Promise<string>((resolve) => {
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

        return '';
    }

    public getAllPortalProviderLinksForEpisode(language: LANGUAGE): ProvidorLink[] {
        const activeLanguage = this.getActiveLanguage();
        if (activeLanguage !== language) {
            return [];
        }

        const providorContainer = this.providerContainerSelector();
        const usedProvidors = this.store.selectSync(getAllUsedProvidors);

        return getLinksForProviders(usedProvidors, providorContainer);
    }

    public getSeriesMetaInformation(): PortalSeriesInfoDto {
        const seasonsLinksElements = [ ...this.seriesSeasonSelector() ];
        const seasonsLinks: PortalSeriesInfoDto['seasonsLinks'] = seasonsLinksElements.reduce((obj, link) => {
            const language = this.getLanguageForLink(link.href);
            return {
                ...obj,
                [link.innerHTML]: {
                    [language]: link.href,
                },
            };
        }, {});

        return {
            seasonsLinks,
            link: window.location.href,
            portal: this.portalKey,
        };
    }

    public getSeasonInfo(seasonNumber: string): PortalSeriesSeasonDto {
        const activeSeason = this.activeSeriesSeasonSelector();
        if (activeSeason.innerText.trim() !== seasonNumber) {
            return null;
        }

        const availableLanguages = this.getAvailableLanguages();
        const seasonLink = activeSeason.href;

        const seasonLinks = this.transformLinkToLanguagesLinksCollection(seasonLink, availableLanguages);
        const episodes = this.getSeasonEpisodes(seasonNumber);

        return {
            portal: this.portalKey,
            seasonNumber,
            episodes,
            seasonLinks,
        };
    }

    public getSeasonEpisodes(seasonNumber: string): PortalSeriesEpisodeDto[] {
        debugger;
        const providors = this.store.selectSync(getAllUsedProvidors);
        const activeLanguage = this.getActiveLanguage();
        const episodesHtmlContainer = [ ...this.episodesSelector() ];

        return episodesHtmlContainer.map((episodeHtmlContainer, index) => {
            const portalLinks = getLinksForProviders(providors, episodeHtmlContainer);

            return {
                seasonNumber,
                portalLinks: {
                    [activeLanguage]: portalLinks,
                },
                episodeNumber: ++index,
                portal: this.portalKey,
            };
        });
    }

    public isVideoOpenWithProvidor(): Providor | null {
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

    public getLinkForSeries(seriesKey: string): string {
        const series = this.store.selectSync(getSeriesByKey, seriesKey);
        const titles = Object.values(series.titles);
        const link = getLinkWithText(titles);
        return link?.href;
    }

    private getVideoUrl(): string {
        return this.videoUrlSelector()?.href || this.videoIframeSelector()?.src;
    }

    private getAvailableLanguages(): LANGUAGE[] {
        const languages = this.languagesSelector()
            .map(element => element.dataset.value)
            .map(languageString => this.stringToLanguage(languageString));
        const filteredLanguages = languages.filter(Boolean);

        if (languages.length > 0 && filteredLanguages.length === 0) {
            return [ LANGUAGE.NONE ];
        }

        return filteredLanguages;
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
        // eslint-disable-next-line no-restricted-syntax
        for (const language of Object.keys(this.languageMap)) {
            const lang = language as LANGUAGE;
            const regex = this.getLinkRegexForLanguage(lang);
            if (regex.test(link)) {
                return lang;
            }
        }
        return LANGUAGE.NONE;
    }

    private getLinkRegexForLanguage(language: LANGUAGE): RegExp {
        return new RegExp(`([^/]*${this.languageMap[language]}$)`);
    }

    private stringToLanguage(languageString: string): LANGUAGE {
        // eslint-disable-next-line no-restricted-syntax
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
