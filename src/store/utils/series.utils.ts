import SeriesEpisode from '../models/series-episode.model';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { getKeyForSeriesEpisode, getKeyForSeriesSeason, getKeyForSeriesTitle } from './key.utils';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import Series from '../models/series.model';
import { SeriesSeason } from '../models/series-season.model';

export function mapSeriesEpisodeDtoToSeriesEpisode(seriesEpisodeDto: SeriesEpisodeDto): SeriesEpisode {
    const { seriesTitle, epdisodeNumber, seasonNumber, portalLinks, portal, providorLinks } = seriesEpisodeDto;

    const seriesKey = getKeyForSeriesTitle(seriesTitle);
    const seasonKey = getKeyForSeriesSeason(seriesKey, seasonNumber);
    const key = getKeyForSeriesEpisode(seriesKey, seasonNumber, epdisodeNumber);

    return {
        key,
        seriesKey,
        seasonKey,
        season: seasonNumber,
        episodeNumber: epdisodeNumber,
        portalLinks: {
            [portal]: portalLinks
        },
        providorLinks: providorLinks
    };
}


export function mapSeriesInfoDtoToSeries(seriesInfo: SeriesInfoDto): Series {
    const { title, posterHref, description, portal, link } = seriesInfo;
    const key = getKeyForSeriesTitle(seriesInfo.title);
    if (posterHref || description) {
        return {
            key,
            title,
            posterHref,
            description,
            portalLinks: { [portal]: link },
        };
    }

    return {
        key,
        title,
        portalLinks: { [portal]: link },
    };
}

export function mapSeriesInfoDtoToSeriesSeasons(seriesInfo: SeriesInfoDto): SeriesSeason[] {
    const seriesKey = getKeyForSeriesTitle(seriesInfo.title);
    return Object.keys(seriesInfo.seasonsLinks).map(seasonNumber => {

        const key = getKeyForSeriesSeason(seriesKey, +seasonNumber);

        return {
            key,
            seriesKey,
            seasonNumber: +seasonNumber,
            portalLinks: { [seriesInfo.portal]: seriesInfo.seasonsLinks[seasonNumber] },
        };
    });
}
