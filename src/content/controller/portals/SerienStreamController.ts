import { inject, injectable } from 'inversify';
import { IPortalController } from './portal.controller.interface';
import { LANGUAGE } from '../../../store/enums/language.enum';
import { ProvidorLink } from '../../../background/models/providor-link.model';
import { Series } from '../../../store/models/series.model';
import { SeriesEpisode } from '../../../store/models/series-episode.model';
import { PROVIDORS } from '../../../store/enums/providors.enum';
import { PortalSeriesEpisodeDto } from '../../../dto/portal-series-episode.dto';
import { PortalSeriesSeasonDto } from '../../../dto/portal-series-season.dto';
import { PortalSeriesInfoDto } from '../../../dto/portal-series-info.dto';
import { getSeriesByKey } from '../../../store/selectors/series.selector';
import {
    getAllElementsWithTextOrProperty,
    getLinkWithTextOrProperty,
    isElementWithTextOrPropertyAvailable,
} from '../../ustils/dom.utils';
import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../../shared/services/store.service';
import { MessageService } from '../../../shared/services/message.service';
import { getAllProvidors, getProvidorForKey } from '../../../store/selectors/providors.selector';
import { isDefined } from '../../../utils/type.utils';
import { PORTALS } from '../../../store/enums/portals.enum';
import { LanguageLinkCollection } from '../../../store/models/language-link.model';
import { getPortalForKey } from '../../../store/selectors/portals.selector';

@injectable()
export class SerienStreamController implements IPortalController {
    private readonly languageStringMap: Partial<{ [key in LANGUAGE]: string }> = {
        [LANGUAGE.GERMAN]: 'Deutsch',
        [LANGUAGE.ENGLISH]: 'Englisch',
        [LANGUAGE.ENGLISH_GERMAN_SUB]: 'mit deutschen Untertiteln',
    };

    private readonly languageKeyMap: Partial<{ [key in LANGUAGE]: string }> = {
        [LANGUAGE.GERMAN]: '1',
        [LANGUAGE.ENGLISH]: '2',
    }

    private readonly languageContainerSelector = (): HTMLElement => getAllElementsWithTextOrProperty({
        textPossibilities: [ 'Sprachen' ],
        containerElementSelectors: [ 'strong' ],
        parentElementSelector: 'div',
    })[0]

    /* eslint-disable max-len */
    private readonly languageSelector = (): Array<HTMLImageElement> => [ ...this.languageContainerSelector().querySelectorAll('img') ];
    private readonly linkContainerSelector = () => document.querySelector('div.hosterSiteVideo');

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService) {
    }

    getAllPortalProviderLinksForEpisode(language: LANGUAGE): ProvidorLink[] {
        const activeLanguage = this.getAllLanguages();
        if (!activeLanguage.includes(language)) {
            return [];
        }
        return [];
    }

    getLinkForSeries(seriesKey: Series['key']): string {
        const series = this.store.selectSync(getSeriesByKey, seriesKey);
        const titles = Object.values(series.titles);
        const link = getLinkWithTextOrProperty({ textPossibilities: titles });
        return link?.href;
    }

    async getResolvedProvidorLinkForEpisode(episodeInfo: SeriesEpisode, providorKey: PROVIDORS, language: LANGUAGE): Promise<string> {
        const providor = this.store.selectSync(getProvidorForKey, providorKey);
        const results = getAllElementsWithTextOrProperty<HTMLElement>({
            textPossibilities: providor.names,
            containerElement: this.linkContainerSelector(),
            parentElementSelector: 'li',
        });

        const finalElement = results.find(element => element.dataset?.langKey === this.languageKeyMap[language]);
        if (finalElement) {
            const link = getLinkWithTextOrProperty({
                textPossibilities: providor.names,
                containerElement: finalElement,
            });
            return Promise.resolve(link.href);
        }

        return Promise.resolve(null);
    }

    private getSeasonEpisodesForActiveSeason(seasonNumber: string): PortalSeriesEpisodeDto[] {
        const episodes: PortalSeriesEpisodeDto[] = [];
        const providors = this.store.selectSync(getAllProvidors);
        for (let episodeNumber = 1; true; episodeNumber++) {
            const episodeElements = getAllElementsWithTextOrProperty({
                textPossibilities: [ `Folge ${episodeNumber}`, `Episode ${episodeNumber}` ],
                containerElementSelectors: [ 'table', 'td' ],
                parentElementSelector: 'tr',
            });
            if (episodeElements.length === 0) {
                break;
            }
            const episodeContainer = episodeElements[0];

            const link = getLinkWithTextOrProperty({
                textPossibilities: [ '' ],
                containerElement: episodeContainer,
            }).href;

            const availableProvidors = providors.filter(providor => isElementWithTextOrPropertyAvailable({
                textPossibilities: providor.names,
                containerElement: episodeContainer,
            })).map<ProvidorLink>(providor => ({
                providor: providor.key,
                link,
            }));

            const portalLinks = Object.entries(this.languageStringMap).map(([ language, selector ]: [ LANGUAGE, string ]) => {
                const isLanguageAvailable = isElementWithTextOrPropertyAvailable({
                    textPossibilities: [ selector ],
                    containerElement: episodeContainer,
                });
                return isLanguageAvailable ? language : null;
            }).filter(isDefined).reduce<PortalSeriesEpisodeDto['portalLinks']>((allData, language) => ({
                ...allData,
                [language]: availableProvidors,
            }), {});

            episodes.push({
                seasonNumber,
                portalLinks,
                portal: PORTALS.STO,
                episodeNumber,
            });
        }

        return episodes;
    }

    getSeasonInfo(seasonNumber: string): PortalSeriesSeasonDto {
        const seasonLink = getLinkWithTextOrProperty({
            textPossibilities: [ `Staffel ${seasonNumber}` ],
            containerElement: this.getSeasonLinkContainer(),
        });
        if (!seasonLink) {
            return null;
        }
        if (!seasonLink.classList.contains('active')) {
            seasonLink.click();
        }

        const episodes = this.getSeasonEpisodesForActiveSeason(seasonNumber);
        const languages = episodes.flatMap(episode => Object.keys(episode.portalLinks));
        const seasonLinks = languages.reduce((allData, language) => ({
            ...allData,
            [language]: seasonLink.href,
        }), {} as LanguageLinkCollection);
        return {
            seasonLinks,
            seasonNumber,
            episodes,
            portal: PORTALS.STO,
        };
    }

    getSeriesMetaInformation(): PortalSeriesInfoDto {
        const seasonLinks = this.getSeasonLinks();

        const seasonsLinks = seasonLinks.reduce((allSeasons, seasonLink) => {
            return {
                ...allSeasons,
                [seasonLink.text]: {
                    [LANGUAGE.GERMAN]: seasonLink.href,
                },
            };
        }, {} as PortalSeriesInfoDto['seasonsLinks']);

        return {
            link: window.location.href,
            portal: PORTALS.STO,
            seasonsLinks,
        };
    }

    public isProvidorVideoPreparing(): boolean {
        const portal = this.store.selectSync(getPortalForKey, PORTALS.STO);
        const result = window.location.href.includes(`${portal.baseUrl}redirect`);
        return result;
    }

    private getSeasonLinkContainer(): HTMLElement {
        return getAllElementsWithTextOrProperty({
            textPossibilities: [ 'Staffeln:' ],
            containerElementSelectors: [ 'ul', 'strong' ],
            parentElementSelector: 'ul',
        })[0];
    }

    private getSeasonLinks(): HTMLAnchorElement[] {
        const seasonContainer = this.getSeasonLinkContainer();
        if (!seasonContainer) {
            return [];
        }

        return getAllElementsWithTextOrProperty<HTMLAnchorElement>({
            textPossibilities: [ 'Staffel' ],
            containerElement: seasonContainer,
            containerElementSelectors: [ 'a' ],
        });
    }

    private getEpisodeContainer(): HTMLElement {
        const episodeContainer = getAllElementsWithTextOrProperty({
            textPossibilities: [ 'Episoden:' ],
            containerElementSelectors: [ 'ul', 'strong' ],
            parentElementSelector: 'ul',
        });

        if (episodeContainer.length > 0) {
            return episodeContainer[0];
        }

        return undefined;
    }

    private stringToLanguage(languageString: string): LANGUAGE {
        // eslint-disable-next-line no-restricted-syntax
        for (const language of Object.keys(this.languageStringMap)) {
            if (languageString === this.languageStringMap[language]) {
                return language as LANGUAGE;
            }
        }

        return null;
    }

    private getAllLanguages(): LANGUAGE[] {
        return this.languageSelector().map(languageElement => this.stringToLanguage(languageElement.dataset.value));
    }

    private getActiveLanguage(): LANGUAGE {
        const languageElement = this.languageSelector().find(link => link.classList.contains('.selectedLanguage'));
        if (!languageElement) {
            return LANGUAGE.NONE;
        }

        return this.stringToLanguage(languageElement.dataset.value);
    }

    private getLanguageLink(language: LANGUAGE): HTMLElement | null {
        const containerElement = this.languageContainerSelector();
        return getAllElementsWithTextOrProperty({
            textPossibilities: [ this.languageStringMap[language] ],
            containerElement,
            containerElementSelectors: [ 'img' ],
        })[0];
    }
}
