import SeriesEpisode from './series-episode.model';
import { PORTALS } from '../enums/portals.enum';
import { LinkModel } from './link.model';
import { LANGUAGE } from '../enums/language.enum';
import { SeriesSeason } from './series-season.model';
import { KeyModel } from './key-model.interface';
import { MovieApi } from '../enums/movie-api.enum';
import { Hoster } from '../enums/hoster.enum';
import { Genre } from './genre.model';

export default interface Series extends KeyModel<string> {
    titles: Partial<Record<LANGUAGE, string>>;
    apiKeys: Partial<Record<MovieApi, string>>;
    previewVideos: Partial<Record<Hoster, string>>;
    descriptions: Partial<Record<LANGUAGE, string>>;
    lastEpisodeWatched?: SeriesEpisode['key'];
    lastUsedPortal?: PORTALS;
    lastUsedLanguage?: LANGUAGE;
    isStartTimeConfigured?: boolean;
    isEndTimeConfigured?: boolean;
    posterHref?: string;
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
        titles: {},
        apiKeys: {},
        previewVideos: {},
        descriptions: {},
        portalLinks: [],
        seasons: [],
        genres: [],
    };
}
