import SeriesEpisode from './series-episode.model';

export default interface Series {
    key: string;
    title: string;
    description?: string;
    lastEpisodeWatched?: SeriesEpisode['key'];
    isStartTimeConfigured?: boolean;
    isEndTimeConfigured?: boolean;
    posterHref: string;
    scipStartTime?: number;
    scipEndTime?: number;
}
