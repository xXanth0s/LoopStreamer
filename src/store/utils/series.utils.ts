import SeriesEpisode from '../models/series-episode.model';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { getKeyForSeriesEpisode, getKeyForSeriesSeason, getKeyForSeriesTitle } from './key.utils';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import Series from '../models/series.model';
import { SeriesSeason } from '../models/series-season.model';
import { END_TIME_BUFFER, TIME_FOR_NEXT_EPISODE_POPUP, TIME_FOR_SET_ENDTIME_POPUP } from '../../constants/popup-config';
import { SeriesSeasonDto } from '../../dto/series-season.dto';

export function mapSeriesEpisodeDtoToSeriesEpisode(seriesEpisodeDto: SeriesEpisodeDto): SeriesEpisode {
    const { seriesTitle, episodeNumber, seasonNumber } = seriesEpisodeDto;

    const seriesKey = getKeyForSeriesTitle(seriesTitle);
    const seasonKey = getKeyForSeriesSeason(seriesKey, `${seasonNumber}`);
    const key = getKeyForSeriesEpisode(seriesKey, seasonNumber, episodeNumber);


    return {
        key,
        seriesKey,
        seasonKey,
        episodeNumber,
        season: seasonNumber,
        portalLinks: [],
        providorLinks: [],
    };
}


export function mapSeriesInfoDtoToSeries(seriesInfo: SeriesInfoDto): Series {
    const { title, posterHref, description } = seriesInfo;
    const key = getKeyForSeriesTitle(seriesInfo.title);
    if (posterHref || description) {
        return {
            key,
            title,
            posterHref,
            description,
            portalLinks: [],
            seasons: [],
        };
    }

    return {
        key,
        title,
        portalLinks: [],
        seasons: [],
    };
}

export function mapSeriesInfoDtoToSeriesSeasons(seriesInfo: SeriesInfoDto): SeriesSeason[] {
    const seriesKey = getKeyForSeriesTitle(seriesInfo.title);
    return Object.keys(seriesInfo.seasonsLinks).map(seasonNumber => {

        const key = getKeyForSeriesSeason(seriesKey, seasonNumber);

        return {
            key,
            seriesKey,
            seasonNumber: seasonNumber,
            portalLinks: [],
            episodes: [],
        };
    });
}

export function mapSeriesSeasonDtoToSeriesSeason(seasonDto: SeriesSeasonDto): SeriesSeason {
    const { seasonNumber, seriesTitle } = seasonDto;

    const seriesKey = getKeyForSeriesTitle(seriesTitle);
    const key = getKeyForSeriesSeason(seriesKey, seasonNumber);

    return {
        key,
        seriesKey,
        seasonNumber: seasonNumber,
        portalLinks: [],
        episodes: [],
    };
}

export function getProgressForEpisode(seriesEpisode: SeriesEpisode): number {
    if (seriesEpisode.isFinished) {
        return 100;
    }

    const { timestamp, duration } = seriesEpisode;
    if (timestamp) {
        return Math.trunc((timestamp / duration) * 100);
    }

    return 0;
}

export function getSeriesEpisodeTitle(seriesEpisode: SeriesEpisode): string {
    return `S${addLeadingZero(seriesEpisode.season)} E${addLeadingZero(seriesEpisode.episodeNumber)}`;
}

function addLeadingZero(digit: string | number): string {
    const stringValue = `${digit}`;
    if (isNaN(+stringValue)) {
        return stringValue;
    }
    if (stringValue.length === 1) {
        return `0${digit}`;
    }

    return stringValue;
}

export function getPopupEndTimeForSeriesEpisode(series: Series) {
    const { isEndTimeConfigured, scipEndTime } = series;

    if (!isEndTimeConfigured) {
        return TIME_FOR_SET_ENDTIME_POPUP;
    }

    if (scipEndTime < TIME_FOR_NEXT_EPISODE_POPUP - END_TIME_BUFFER) {
        return TIME_FOR_NEXT_EPISODE_POPUP;
    }

    return scipEndTime + TIME_FOR_NEXT_EPISODE_POPUP - END_TIME_BUFFER;
}

export function isVeryFirstEpisode(seriesEpisode: SeriesEpisode): boolean {
    return +seriesEpisode.season === 1 && seriesEpisode.episodeNumber === 1;
}
