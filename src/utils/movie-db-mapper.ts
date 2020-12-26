import { Responses } from 'node-themoviedb';
import {
    getKeyForSeriesEpisode,
    getKeyForSeriesSeason,
    getKeyForSeriesTitle
} from '../store/utils/key.utils';
import { LANGUAGE } from '../store/enums/language.enum';
import Series, { getEmptySeries } from '../store/models/series.model';
import { mapLanguage } from './language-mapper';
import { MovieApi } from '../store/enums/movie-api.enum';
import { SeriesSeason } from '../store/models/series-season.model';
import SeriesEpisode, { getEmptySeriesEpisode } from '../store/models/series-episode.model';
import { Hoster } from '../store/enums/hoster.enum';
import { Genre } from '../store/models/genre.model';
import { getYearFromDateString } from './date.utils';
import { SeriesMetaInfo } from '../store/models/series-meta-info.model';

export type MovieDbMetaInfo = {
    poster_path: string | null;
    popularity: number;
    id: number;
    name: string;
    original_name: string;
    backdrop_path: string | null;
    overview: string;
    first_air_date: string;
    genre_ids: number[];
    original_language: string;
}

export function mapSeriesMetaInfoFromMovieDB(series: MovieDbMetaInfo, activeLanguage: LANGUAGE): SeriesMetaInfo {
    const {
        id,
        name,
        original_language,
        original_name,
        poster_path
    } = series;


    const seriesLanguage = mapLanguage(original_language);
    const key = getKeyForSeriesTitle(original_name);

    return {
        key,
        posterHref: `https://image.tmdb.org/t/p/w220_and_h330_face/${poster_path}`,

        titles: {
            [activeLanguage]: name,
            [seriesLanguage]: original_name,
        },
        apiKeys: {
            [MovieApi.TMDB]: `${id}`,
        },
    };
}


export function mapSeriesFromMovieDB(series: Responses.TV.GetDetails, activeLanguage: LANGUAGE, videoKey?: string): Series {
    const {
        overview,
        backdrop_path,
        first_air_date
    } = series;


    const previewVideos = !videoKey ? {} : {
        [Hoster.YOUTUBE]: videoKey,
    };

    const genres = series.genres.map(genre => `${genre.id}`);

    return {
        ...getEmptySeries(),
        ...mapSeriesMetaInfoFromMovieDB(series, activeLanguage),
        previewVideos,
        genres,
        backgroundHref: `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${backdrop_path}`,
        startYear: getYearFromDateString(first_air_date),
        descriptions: {
            [activeLanguage]: overview,
        }
    };
}

export function mapSeasonFromMovieDB(season: Responses.TV.Season.GetDetails, seriesKey: string): SeriesSeason {
    const { season_number } = season;

    const seasonNumber = `${season_number}`;
    const key = getKeyForSeriesSeason(seriesKey, seasonNumber);

    return {
        key,
        seriesKey,
        seasonNumber,
        portalLinks: [],
        episodes: [],
    };
}

export function mapSeasonEpisodesFromMovieDB(season: Responses.TV.Season.GetDetails, seriesKey: string, language: LANGUAGE): SeriesEpisode[] {
    const { season_number, episodes } = season;

    const seasonNumber = `${season_number}`;
    const seasonKey = getKeyForSeriesSeason(seriesKey, seasonNumber);

    return episodes.map(episode => {
        const {
            episode_number, overview, name, still_path,
        } = episode;
        const key = getKeyForSeriesEpisode(seriesKey, seasonNumber, episode_number);
        return {
            ...getEmptySeriesEpisode(),
            key,
            seriesKey,
            seasonKey,
            season: seasonNumber,
            episodeNumber: episode_number,
            posterHref: still_path ? `https://image.tmdb.org/t/p/w227_and_h127_bestv2${still_path}` : '',
            description: {
                [language]: overview,
            },
            title: {
                [language]: name,
            },
        };
    });
}

export function mapGenreFromMovieDB(genre: Responses.Genre.Common['genres'][number], language: LANGUAGE): Genre {
    return {
        key: `${genre.id}`,
        translations: {
            [language]: genre.name
        },
    };
}

export function orderByMovieDBPopularity<T extends { popularity: number }>(series: T[]): T[] {
    return series.sort((a, b) => b.popularity - a.popularity);
}
