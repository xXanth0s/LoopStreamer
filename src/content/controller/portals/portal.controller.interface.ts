import Providor from '../../../store/models/providor.model';
import SeriesEpisode from '../../../store/models/series-episode.model';
import { PortalSeriesInfoDto } from '../../../dto/portal-series-info.dto';
import { PortalSeriesEpisodeDto } from '../../../dto/portal-series-episode.dto';
import { PROVIDORS } from '../../../store/enums/providors.enum';
import { LANGUAGE } from '../../../store/enums/language.enum';
import { ProvidorLink } from '../../../background/models/providor-link.model';
import { PortalSeriesSeasonDto } from '../../../dto/portal-series-season.dto';
import Series from '../../../store/models/series.model';

export interface IPortalController {

    getResolvedProvidorLinkForEpisode(episodeInfo: SeriesEpisode, providor: PROVIDORS): Promise<string>;

    getAllPortalProviderLinksForEpisode(language: LANGUAGE): ProvidorLink[];

    isVideoOpenWithProvidor(): Providor | null;

    getLinkForSeries(seriesKey: Series['key']): string;

    getSeasonInfo(seasonNumber: string): PortalSeriesSeasonDto;

    getSeriesMetaInformation(): PortalSeriesInfoDto;

    getSeasonEpisodes(seasonNumber: string): PortalSeriesEpisodeDto[];
}
