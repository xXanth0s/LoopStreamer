import SeriesEpisode from './series-episode.model';
import { PORTALS } from '../enums/portals.enum';
import { LinkModel } from './link.model';
import { LANGUAGE } from '../enums/language.enum';
import { SeriesSeason } from './series-season.model';
import { Hoster } from '../enums/hoster.enum';
import { Genre } from './genre.model';
import { SeriesMetaInfo } from './series-meta-info.model';

export default interface Series extends SeriesMetaInfo {
    previewVideos: Partial<Record<Hoster, string>>;
    descriptions: Partial<Record<LANGUAGE, string>>;
    lastEpisodeWatched?: SeriesEpisode['key'];
    lastUsedPortal?: PORTALS;
    lastUsedLanguage?: LANGUAGE;
    isStartTimeConfigured?: boolean;
    isEndTimeConfigured?: boolean;
    backgroundHref?: string;
    portalLinks: LinkModel['key'][];
    seasons: SeriesSeason['key'][];
    genres: Genre['key'][];
    scipStartTime?: number;
    scipEndTime?: number;
    startYear?: string;
    endYear?: string;
}

export function getEmptySeries(): Series {
    return {
        key: '',
        posterHref: '',
        titles: {},
        apiKeys: {},
        previewVideos: {},
        descriptions: {},
        portalLinks: [],
        seasons: [],
        genres: [],
    };
}
