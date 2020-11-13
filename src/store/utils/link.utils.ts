import { SeriesInfoDto } from '../../dto/series-info.dto';
import { LinkModel } from '../models/link.model';
import { getKeyForLink, getKeyForSeriesEpisode, getKeyForSeriesSeason, getKeyForSeriesTitle } from './key.utils';
import { Language } from '../enums/language.enum';
import { LINK_TYPE } from '../enums/link-type.enum';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { PROVIDORS } from '../enums/providors.enum';

export function generateLinkForSeries(seriesInfo: SeriesInfoDto): LinkModel {
    const { title, link, portal } = seriesInfo;
    const parentKey = getKeyForSeriesTitle(title);
    const key = getKeyForLink({ parentKey, portal, language: Language.NONE });

    return {
        key,
        parentKey,
        portal,
        language: Language.NONE,
        href: link,
        type: LINK_TYPE.PORTAL_SERIES_LINK,
    };
}

export function generateLinksForSeriesSeason(seriesInfo: SeriesInfoDto): LinkModel[] {
    const { title, portal } = seriesInfo;

    const seriesKey = getKeyForSeriesTitle(title);
    return Object.entries(seriesInfo.seasonsLinks).reduce((accumulator, value) => {
        const seasonNumber = value[0];
        const parentKey = getKeyForSeriesSeason(seriesKey, seasonNumber);

        return Object.entries(value[1]).reduce<LinkModel[]>((accumulator, linkValue) => {
            const language = linkValue[0] as Language;
            const href = linkValue[1];
            const key = getKeyForLink({ parentKey, portal, language });
            return [
                ...accumulator,
                {
                    key,
                    parentKey,
                    language,
                    href,
                    portal,
                    type: LINK_TYPE.PORTAL_SEASON_LINK,
                }
            ];
        }, accumulator);
    }, []);
}

export function generateLinkForSeriesEpisode(seriesEpisode: SeriesEpisodeDto, type: LINK_TYPE): LinkModel[] {
    const { seriesTitle, episodeNumber, seasonNumber, portalLinks, portal } = seriesEpisode;
    const seriesKey = getKeyForSeriesTitle(seriesTitle);
    const parentKey = getKeyForSeriesEpisode(seriesKey, seasonNumber, episodeNumber);

    return Object.keys(portalLinks).reduce((links: LinkModel[], language: Language) => {
        const languageLinks = portalLinks[language];

        return Object.keys(languageLinks).reduce((accumulator: LinkModel[], providor: PROVIDORS) => {
            const key = getKeyForLink({ parentKey, portal, language });
            const href = languageLinks[providor];
            return [
                ...accumulator,
                {
                    key,
                    parentKey,
                    language,
                    href,
                    providor,
                    portal,
                    type
                },
            ];
        }, links);
    }, []);

}

