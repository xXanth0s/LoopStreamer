import { inject } from 'inversify';
import { IPortalController } from './portal.controller.interface';
import { LANGUAGE } from '../../../store/enums/language.enum';
import { ProvidorLink } from '../../../background/models/providor-link.model';
import { Series } from '../../../store/models/series.model';
import { SeriesEpisode } from '../../../store/models/series-episode.model';
import { PROVIDORS } from '../../../store/enums/providors.enum';
import { PortalSeriesEpisodeDto } from '../../../dto/portal-series-episode.dto';
import { PortalSeriesSeasonDto } from '../../../dto/portal-series-season.dto';
import { PortalSeriesInfoDto } from '../../../dto/portal-series-info.dto';
import { Providor } from '../../../store/models/providor.model';
import { getSeriesByKey } from '../../../store/selectors/series.selector';
import { getAllLinksWithTextOrProperty, getLinkWithText } from '../../ustils/dom.utils';
import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../../shared/services/store.service';
import { MessageService } from '../../../shared/services/message.service';
import { getProvidorForKey } from '../../../store/selectors/providors.selector';

export class SerienStreamController implements IPortalController {
    private readonly languageMap: Partial<{ [key in LANGUAGE]: string }> = {
        [LANGUAGE.GERMAN]: 'Deutsch',
        [LANGUAGE.ENGLISH]: 'Englisch',
        [LANGUAGE.ENGLISH_GERMAN_SUB]: 'mit deutschen Untertiteln',
        [LANGUAGE.NONE]: '',
    };

    private readonly languageContainerSelector = () => document.querySelector('div.changeLanguage');
    /* eslint-disable max-len */
    private readonly languageSelector = (): Array<HTMLImageElement> => [...this.languageContainerSelector().querySelectorAll('img')];
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
        const link = getLinkWithText(titles);
        return link?.href;
    }

    getResolvedProvidorLinkForEpisode(episodeInfo: SeriesEpisode, providorKey: PROVIDORS, language?: LANGUAGE): Promise<string> | string {
        const isLanguageAvailable = this.selectLanguage(language);
        if (!isLanguageAvailable) {
            return Promise.resolve('');
        }

        const providor = this.store.selectSync(getProvidorForKey, providorKey);
        const result = getLinkWithText(providor.names, this.linkContainerSelector());
        return Promise.resolve(result.href);
    }

    getSeasonEpisodes(seasonNumber: string): PortalSeriesEpisodeDto[] {
        const seasonLink = getLinkWithText([`Staffel ${seasonNumber}`]);
        if (!seasonLink.classList.contains('active')) {
            seasonLink.click();
        } else {

        }
        return [];
    }

    getSeasonInfo(seasonNumber: string): PortalSeriesSeasonDto {
        return undefined;
    }

    getSeriesMetaInformation(): PortalSeriesInfoDto {
        return undefined;
    }

    isVideoOpenWithProvidor(): Providor | null {
        return undefined;
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

    private selectLanguage(language: LANGUAGE): boolean {
        const link = getLinkWithText([this.languageMap[language]], this.languageContainerSelector());
        if (!link) {
            return false;
        }

        link.click();
        return true;
    }
}
