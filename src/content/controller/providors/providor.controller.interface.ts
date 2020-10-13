import SeriesEpisode from '../../../store/models/series-episode.model';

export interface IProvidorController {

    startVideo(seriesEpisodeKey: SeriesEpisode['key']): boolean;
}
