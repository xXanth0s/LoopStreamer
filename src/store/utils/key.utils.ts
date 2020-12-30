import { Series } from '../models/series.model';
import { LinkModel } from '../models/link.model';

type linkKeyData = {
    parentKey: LinkModel['parentKey'];
    portal?: LinkModel['portal'];
    providor?: LinkModel['providor'];
    language: LinkModel['language'];
}

export const getKeyForSeriesTitleAndDate = (seriesTitle: string, firstAiredYear: string): string => {
    const titleKey = seriesTitle?.toLowerCase().replace(/\s/g, '-');
    return `${titleKey}-${firstAiredYear}`;
};

export const getKeyForSeriesSeason = (seriesKey: Series['key'], season: string): string => `${seriesKey}-S${season}`;

export const getKeyForSeriesEpisode = (seriesKey: string,
                                       seasonNumber: string,
                                       // eslint-disable-next-line max-len
                                       episodeNumber: number): string => `${seriesKey}-S${seasonNumber}-E${episodeNumber}`;

export function getKeyForLink(data: linkKeyData): string {
    const {
        language, parentKey, portal, providor,
    } = data;

    const destination = [ portal, providor ].filter(Boolean).join('-');
    return `${parentKey}-${destination}-${language}`;
}
