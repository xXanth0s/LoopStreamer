import Providor from '../../../store/models/providor.model';
import SeriesEpisode from '../../../store/models/series-episode.model';
import { SeriesMetaInfoDto } from '../../../dto/series-meta-info.dto';
import { SeriesInfoDto } from '../../../dto/series-info.dto';
import { SeriesEpisodeDto } from '../../../dto/series-episode.dto';
import { PROVIDORS } from '../../../store/enums/providors.enum';

export interface IPortalController {

    getProvidorLinkForEpisode(episodeInfo: SeriesEpisode, providor: PROVIDORS): Promise<string>;

    isVideoOpenWithProvidor(): Providor | null;

    getAllSeriesInfo(): SeriesMetaInfoDto[];

    getSeriesMetaInformation(): SeriesInfoDto;

    getSeasonEpisodes(seasonNumber: number): SeriesEpisodeDto[];
}
