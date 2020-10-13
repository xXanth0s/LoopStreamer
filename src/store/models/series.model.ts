import SeriesEpisode from './series-episode.model';
import { SeriesSeason } from './series-season.model';

export default interface Series {
    key: string;
    title: string;
    description?: string;
    lastEpisodeWatched?: SeriesEpisode['key'];
    seasons: SeriesSeason['key'][];
    isStartTimeConfigured?: boolean;
    isEndTimeConfigured?: boolean;
    posterHref: string;
    scipStartTime?: number;
    scipEndTime?: number;
}
