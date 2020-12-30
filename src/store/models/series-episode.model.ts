import { Series } from './series.model';
import { LinkModel } from './link.model';
import { LANGUAGE } from '../enums/language.enum';

export interface SeriesEpisode {
    key: string;
    seriesKey: string;
    seasonKey: Series['key'];
    season: string;
    episodeNumber: number;
    duration?: number;
    description: Partial<Record<LANGUAGE, string>>;
    posterHref?: string;
    title: Partial<Record<LANGUAGE, string>>;
    hasNextEpisode?: boolean;
    hasPreviousEpisode?: boolean;
    portalLinks: LinkModel['key'][];
    providorLinks: LinkModel['key'][];
    timestamp?: number;
    isFinished?: boolean;
}

export function getEmptySeriesEpisode(): SeriesEpisode {
    return {
        key: '',
        seriesKey: '',
        seasonKey: '',
        season: '',
        episodeNumber: 0,
        description: {},
        title: {},
        portalLinks: [],
        providorLinks: [],
    };
}
