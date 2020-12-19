import { PortalSeriesInfoDto } from '../../dto/portal-series-info.dto';
import { getEmptyLinkModel, LinkModel } from '../models/link.model';
import { getKeyForLink, getKeyForSeriesEpisode, getKeyForSeriesSeason, getKeyForSeriesTitle, } from './key.utils';
import { LANGUAGE } from '../enums/language.enum';
import { LINK_TYPE } from '../enums/link-type.enum';
import { PortalSeriesEpisodeDto } from '../../dto/portal-series-episode.dto';
import SeriesEpisode from '../models/series-episode.model';
import { PORTALS } from '../enums/portals.enum';
import { ProvidorLink } from '../../background/models/providor-link.model';
import { PortalSeriesSeasonDto } from '../../dto/portal-series-season.dto';
import { Logger } from '../../shared/services/logger';
import { environment } from '../../environments/environment';
import differenceInMinutes from 'date-fns/differenceInMinutes';


export function generateLinkForSeries(seriesKey: string, portal: PORTALS, href: string): LinkModel {
    const key = getKeyForLink({ parentKey: seriesKey, portal, language: LANGUAGE.NONE });

    return {
        ...getEmptyLinkModel(),
        key,
        href,
        portal,
        parentKey: seriesKey,
        type: LINK_TYPE.PORTAL_SERIES_LINK,
    };
}

export function generateLinksForSeriesSeasonFromSeriesDto(seriesInfo: PortalSeriesInfoDto, seriesKey: string): LinkModel[] {
    const { portal, seasonsLinks } = seriesInfo;

    return Object.entries(seasonsLinks).reduce((accumulator, value) => {
        const seasonNumber = value[0];
        const parentKey = getKeyForSeriesSeason(seriesKey, seasonNumber);

        return Object.entries(value[1]).reduce<LinkModel[]>((accumulator, linkValue) => {
            const language = linkValue[0] as LANGUAGE;
            const href = linkValue[1];
            const key = getKeyForLink({ parentKey, portal, language });
            return [
                ...accumulator,
                {
                    ...getEmptyLinkModel(),
                    key,
                    parentKey,
                    language,
                    href,
                    portal,
                    type: LINK_TYPE.PORTAL_SEASON_LINK,
                },
            ];
        }, accumulator);
    }, []);
}

export function generateLinksForSeriesSeasonDto(seriesSeasonDto: PortalSeriesSeasonDto): LinkModel[] {
    const {
        seriesTitle, seasonNumber, seasonLinks, portal,
    } = seriesSeasonDto;
    if (!seasonLinks) {
        Logger.error('[generateLinksForSeriesSeasonDto] no season links found in seriesSeasonDto', seasonLinks);
        return [];
    }
    const seriesKey = getKeyForSeriesTitle(seriesTitle);
    const parentKey = getKeyForSeriesSeason(seriesKey, seasonNumber);

    return Object.keys(seasonLinks).map((language: LANGUAGE) => {
        const key = getKeyForLink({ parentKey, portal, language });

        return {
            ...getEmptyLinkModel(),
            language,
            portal,
            href: seasonLinks[language],
            type: LINK_TYPE.PORTAL_SEASON_LINK,
            parentKey,
            key,
        };
    });
}

export function generateLinkForSeriesEpisodeDto(seriesEpisode: PortalSeriesEpisodeDto, type: LINK_TYPE): LinkModel[] {
    const {
        seriesTitle, episodeNumber, seasonNumber, portalLinks, portal,
    } = seriesEpisode;
    const seriesKey = getKeyForSeriesTitle(seriesTitle);
    const parentKey = getKeyForSeriesEpisode(seriesKey, seasonNumber, episodeNumber);

    return Object.keys(portalLinks).map((language: LANGUAGE) => portalLinks[language].map(({ link, providor }: ProvidorLink) => {
        if (!link) {
            return;
        }
        const key = getKeyForLink({
            parentKey, portal, providor, language,
        });
        return {
            ...getEmptyLinkModel(),
            key,
            parentKey,
            language,
            providor,
            portal,
            type,
            href: link,
        };
    }).filter(Boolean)).flat();
}

export function generateLinkForProvidorLink(seriesEpisodeKey: SeriesEpisode['key'],
                                            providorLink: ProvidorLink,
                                            language: LANGUAGE,
                                            type: LINK_TYPE,
                                            portal?: PORTALS): LinkModel {
    const { link, providor } = providorLink;
    const key = getKeyForLink({
        parentKey: seriesEpisodeKey, portal, providor, language,
    });

    return {
        ...getEmptyLinkModel(),
        providor,
        portal,
        key,
        language,
        type,
        parentKey: seriesEpisodeKey,
        href: link,
    };
}

export function isLinkOutdated(link: LinkModel): boolean {
    const { dateUpdated } = link;

    return differenceInMinutes(dateUpdated, Date.now()) > environment.linkCacheTimeInMinutes;
}
