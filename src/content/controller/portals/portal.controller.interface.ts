import Series from '../../../store/models/series.model';
import Providor from '../../../store/models/providor.model';
import SeriesEpisode from '../../../store/models/series-episode.model';
import { SeriesMetaInfoDto } from '../../../dto/series-meta-info.dto';
import { SeriesInfoDto } from '../../../dto/series-info.dto';
import { SeriesEpisodeDto } from '../../../dto/series-episode.dto';

export interface IPortalController {

    getLinkForOpenVideo(): boolean;

    isVideoOpenWithProvidor(): Providor | null;

    getEpisodeInfo(withVideoLink: boolean): Promise<SeriesEpisodeDto>;

    getLinkForEpisodeWithOffset(offset: number): Promise<string>;

    getAllSeriesInfo(): SeriesMetaInfoDto[];

    getSeriesMetaInformation(): SeriesInfoDto;

    getSeasonEpisodes(seasonNumber: number): SeriesEpisodeDto[];
}
