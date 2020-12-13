import Series from '../models/series.model';
import { LinkModel } from '../models/link.model';

type linkKeyData = {
    parentKey: LinkModel['parentKey'],
    portal?: LinkModel['portal'],
    providor?: LinkModel['providor'],
    language: LinkModel['language']
}

export const getKeyForSeriesTitle = (seriesTitle: string): string => {
    return seriesTitle?.toLowerCase().replace(/\s/g, '-');
}

export const getKeyForSeriesSeason = (seriesKey: Series['key'], season: string): string => {
    return `${seriesKey}-S${season}`;
}

export const getKeyForSeriesEpisode = (seriesKey: string, seasonNumber: string, episodeNumber: number): string => {
    return `${seriesKey}-S${seasonNumber}-E${episodeNumber}`;
};

export function getKeyForLink(data: linkKeyData): string {
    const {language, parentKey, portal, providor} = data

    const destination = [ portal, providor ].filter(Boolean).join('-');
    return `${parentKey}-${destination}-${language}`
}
