import { SeriesEpisode } from '../../../store/models/series-episode.model';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IProvidorController {

    startVideo(seriesEpisodeKey: SeriesEpisode['key']): boolean;
}
