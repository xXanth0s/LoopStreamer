import { SeriesEpisode } from '../../../store/models/series-episode.model';
import { PortalSeriesInfoDto } from '../../../dto/portal-series-info.dto';
import { PROVIDORS } from '../../../store/enums/providors.enum';
import { LANGUAGE } from '../../../store/enums/language.enum';
import { ProvidorLink } from '../../../background/models/providor-link.model';
import { PortalSeriesSeasonDto } from '../../../dto/portal-series-season.dto';
import { Series } from '../../../store/models/series.model';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPortalController {

    getResolvedProvidorLinkForEpisode(episodeInfo: SeriesEpisode,
                                      providor: PROVIDORS,
                                      language: LANGUAGE): Promise<string> | string;

    getAllPortalProviderLinksForEpisode(language: LANGUAGE): ProvidorLink[];

    getLinkForSeries(seriesKey: Series['key']): string;

    getSeasonInfo(seasonNumber: string): PortalSeriesSeasonDto;

    getSeriesMetaInformation(): PortalSeriesInfoDto;

    isProvidorVideoPreparing(): boolean;
}
