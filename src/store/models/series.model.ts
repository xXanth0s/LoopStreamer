import SeriesEpisode from './series-episode.model';
import { PORTALS } from '../enums/portals.enum';
import { LinkModel } from './link.model';
import { LANGUAGE } from '../enums/language.enum';
import { SeriesSeason } from './series-season.model';

export default interface Series {
    key: string;
    title: string;
    lastEpisodeWatched?: SeriesEpisode['key'];
    lastUsedPortal?: PORTALS;
    lastUsedLanguage?: LANGUAGE;
    isStartTimeConfigured?: boolean;
    isEndTimeConfigured?: boolean;
    posterHref?: string;
    portalLinks: LinkModel['key'][];
    seasons: SeriesSeason['key'][];
    scipStartTime?: number;
    scipEndTime?: number;
}
