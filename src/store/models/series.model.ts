import SeriesEpisode from './series-episode.model';
import { PORTALS } from '../enums/portals.enum';

export default interface Series {
    key: string;
    title: string;
    description?: string;
    lastEpisodeWatched?: SeriesEpisode['key'];
    isStartTimeConfigured?: boolean;
    isEndTimeConfigured?: boolean;
    posterHref?: string;
    portalLinks: Partial<{
        [key in PORTALS]: string
    }>,
    scipStartTime?: number;
    scipEndTime?: number;
}
