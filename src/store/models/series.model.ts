import SeriesEpisode from './series-episode.model';
import { PORTALS } from '../enums/portals.enum';
import { LinkModel } from './link.model';
import { LANGUAGE } from '../enums/language.enum';
import { SeriesSeason } from './series-season.model';
import { KeyModel } from './key-model.interface';
import { MovieApi } from '../enums/movie-api.enum';
import { Hoster } from '../enums/hoster.enum';

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
    portalLinks: LinkModel['key'][];
    seasons: SeriesSeason['key'][];
    scipStartTime?: number;
    scipEndTime?: number;
}
