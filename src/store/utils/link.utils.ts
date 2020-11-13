import { SeriesInfoDto } from '../../dto/series-info.dto';
import { LinkModel } from '../models/link.model';
import { getKeyForLink, getKeyForSeriesEpisode, getKeyForSeriesSeason, getKeyForSeriesTitle } from './key.utils';
import { LANGUAGE } from '../enums/language.enum';
import { LINK_TYPE } from '../enums/link-type.enum';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { PROVIDORS } from '../enums/providors.enum';
import SeriesEpisode from '../models/series-episode.model';
import { PORTALS } from '../enums/portals.enum';
import { ProvidorLink } from '../../background/models/providor-link.model';

export function generateLinkForSeries(seriesInfo: SeriesInfoDto): LinkModel {
    const { title, link, portal } = seriesInfo;
    const parentKey = getKeyForSeriesTitle(title);
    const key = getKeyForLink({ parentKey, portal, language: LANGUAGE.NONE });

    return {
        key,
        parentKey,
        portal,
        language: LANGUAGE.NONE,
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
            const language = linkValue[0] as LANGUAGE;
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

export function generateLinkForSeriesEpisodeDto(seriesEpisode: SeriesEpisodeDto, type: LINK_TYPE): LinkModel[] {
    const { seriesTitle, episodeNumber, seasonNumber, portalLinks, portal } = seriesEpisode;
    const seriesKey = getKeyForSeriesTitle(seriesTitle);
    const parentKey = getKeyForSeriesEpisode(seriesKey, seasonNumber, episodeNumber);

    return Object.keys(portalLinks).reduce((links: LinkModel[], language: LANGUAGE) => {
        const languageLinks = portalLinks[language];

        return Object.keys(languageLinks).reduce((accumulator: LinkModel[], providor: PROVIDORS) => {
            const key = getKeyForLink({ parentKey, portal, providor, language });
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


export function generateLinkForProvidorLink(seriesEpisodeKey: SeriesEpisode['key'],
                                            providorLink: ProvidorLink,
                                            language: LANGUAGE,
                                            type: LINK_TYPE,
                                            portal?: PORTALS): LinkModel {
    const { link, providor } = providorLink;
    const key = getKeyForLink({ parentKey: seriesEpisodeKey, portal, providor, language });
    return {
        providor,
        portal,
        key,
        language,
        type,
        parentKey: seriesEpisodeKey,
        href: link,
    };

}



