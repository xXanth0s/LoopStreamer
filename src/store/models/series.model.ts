import SeriesEpisode from './series-episode.model';
import { PORTALS } from '../enums/portals.enum';
import { LinkModel } from './link.model';

export default interface Series {
    key: string;
    title: string;
    description?: string;
    lastEpisodeWatched?: SeriesEpisode['key'];
    lastUsedPortal?: PORTALS;
    isStartTimeConfigured?: boolean;
    isEndTimeConfigured?: boolean;
    posterHref?: string;
    portalLinks: LinkModel['key'][]
    scipStartTime?: number;
    scipEndTime?: number;
}
