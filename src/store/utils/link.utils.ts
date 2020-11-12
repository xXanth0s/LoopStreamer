import { SeriesInfoDto } from '../../dto/series-info.dto';
import { LinkModel } from '../models/link.model';
import { getKeyForLink, getKeyForSeriesSeason, getKeyForSeriesTitle } from './key.utils';
import { Language } from '../enums/language.enum';
import { LINK_TYPE } from '../enums/link-type.enum';

export function generateLinkForSeries(seriesInfo: SeriesInfoDto): LinkModel {
    const { title, link, portal } = seriesInfo;
    const parentKey = getKeyForSeriesTitle(title);
    const key = getKeyForLink(parentKey, portal, Language.NONE);

    return {
        key,
        parentKey,
        language: Language.NONE,
        destination: portal,
        href: link,
        type: LINK_TYPE.PORTAL_SERIES_LINK,
    }
}

export function generateLinksForSeriesSeason(seriesInfo: SeriesInfoDto): LinkModel[] {
    const { title, portal } = seriesInfo;

    const seriesKey = getKeyForSeriesTitle(title);
    return Object.entries(seriesInfo.seasonsLinks).reduce((accumulator, value) => {
        const seasonNumber = value[0];
        const parentKey = getKeyForSeriesSeason(seriesKey, seasonNumber)

        return Object.entries(value[1]).reduce((accumulator, linkValue) => {
            const language = linkValue[0] as Language;
            const href = linkValue[1];
            const key = getKeyForLink(parentKey, seriesInfo.portal, language);
            return [
                ...accumulator,
                {
                    key,
                    parentKey,
                    language,
                    href,
                    destination: portal,
                    type: LINK_TYPE.PORTAL_SEASON_LINK,
                }
            ]
        }, accumulator)
    }, [])
}

