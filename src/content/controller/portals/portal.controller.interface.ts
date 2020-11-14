import Providor from '../../../store/models/providor.model';
import SeriesEpisode from '../../../store/models/series-episode.model';
import { SeriesInfoDto } from '../../../dto/series-info.dto';
import { SeriesEpisodeDto } from '../../../dto/series-episode.dto';
import { PROVIDORS } from '../../../store/enums/providors.enum';
import { LANGUAGE } from '../../../store/enums/language.enum';
import { ProvidorLink } from '../../../background/models/providor-link.model';
import { SeriesSeasonDto } from '../../../dto/series-season.dto';

export interface IPortalController {

    getResolvedProvidorLinkForEpisode(episodeInfo: SeriesEpisode, providor: PROVIDORS): Promise<string>;

    getAllPortalProviderLinksForEpisode(language: LANGUAGE): ProvidorLink[];

    isVideoOpenWithProvidor(): Providor | null;

    getAllSeriesInfo(): SeriesInfoDto[];

    getSeasonInfo(seasonNumber: string): SeriesSeasonDto;

    getSeriesMetaInformation(): SeriesInfoDto;

    getSeasonEpisodes(seasonNumber: string): SeriesEpisodeDto[];
}
