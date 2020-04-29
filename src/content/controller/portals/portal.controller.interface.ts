import Series from '../../../store/models/series.model';
import Providor from '../../../store/models/providor.model';
import SeriesEpisodeInfo from '../../../store/models/series-episode-info.model';

export interface IPortalController {

    getLinkForOpenVideo(): boolean;

    isVideoOpenWithProvidor(): Providor | null;

    getSeriesInfo(withVideoLink: boolean): Promise<Series>;

    getEpisodeInfo(withVideoLink: boolean): Promise<SeriesEpisodeInfo>;

    getLinkForEpisodeWithOffset(offset: number): Promise<string>
}
