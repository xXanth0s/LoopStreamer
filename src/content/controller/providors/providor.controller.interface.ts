import Series from '../../../store/models/series.model';
import SeriesEpisode from '../../../store/models/series-episode.model';

export interface IProvidorController {

    startVideo(seriesInfo: SeriesEpisode): boolean;
}
