import Series from '../models/series.model';
import { LinkModel } from '../models/link.model';
import { Keyless } from '../types/keyless.type';

export const getKeyForSeriesTitle = (seriesTitle: string): string => {
    return seriesTitle?.toLowerCase().replace(/[^\w\s]/g,'').replace(/\s/g, "-");
}

export const getKeyForSeriesSeason = (seriesKey: Series['key'], season: string): string => {
    return `${seriesKey}-S${season}`;
}

export const getKeyForSeriesEpisode = (seriesKey: string, seasonNumber: number, episodeNumber: number): string => {
    return `${seriesKey}-S${seasonNumber}-E${episodeNumber}`;
}

export function getKeyForLink( parentKey: LinkModel['parentKey'], destination: LinkModel['destination'], language: LinkModel['language']): string {
    return `${parentKey}-${destination}-${language}`
}
