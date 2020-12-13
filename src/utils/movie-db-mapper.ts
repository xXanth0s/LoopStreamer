import MovieDB, { Responses } from 'node-themoviedb';
import { getKeyForSeriesEpisode, getKeyForSeriesSeason, getKeyForSeriesTitle } from '../store/utils/key.utils';
import { LANGUAGE } from '../store/enums/language.enum';
import Series, { getEmptySeries } from '../store/models/series.model';
import { mapLanguage } from './language-mapper';
import { MovieApi } from '../store/enums/movie-api.enum';
import { SeriesSeason } from '../store/models/series-season.model';
import SeriesEpisode, { getEmptySeriesEpisode } from '../store/models/series-episode.model';
import { Hoster } from '../store/enums/hoster.enum';

export function mapSeriesFromMovieDB(series: MovieDB.Objects.TVShow | Responses.TV.GetDetails, activeLanguage: LANGUAGE, videoKey?: string): Series {
    const { original_name, id, overview, name, poster_path, original_language } = series;

    const seriesLanguage = mapLanguage(original_language);
    const key = getKeyForSeriesTitle(original_name);

    const previewVideos = !videoKey ? {} : {
        [Hoster.YOUTUBE]: videoKey
    };
    return {
        ...getEmptySeries(),
        key,
        previewVideos,
        titles: {
            [activeLanguage]: name,
            [seriesLanguage]: original_name
        },
        descriptions: {
            [activeLanguage]: overview
        },
        posterHref: `https://image.tmdb.org/t/p/w440_and_h660_face/${poster_path}`,
        apiKeys: {
            [MovieApi.TMDB]: `${id}`,
        },
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
        episodes: []
    };
}


export function mapSeasonEpisodesFromMovieDB(season: Responses.TV.Season.GetDetails, seriesKey: string, language: LANGUAGE): SeriesEpisode[] {
    const { season_number, episodes } = season;

    const seasonNumber = `${season_number}`;

    return episodes.map(episode => {
        const { episode_number, overview, name, still_path } = episode;
        const key = getKeyForSeriesEpisode(seriesKey, seasonNumber, episode_number);
        return {
            ...getEmptySeriesEpisode(),
            key,
            seriesKey,
            season: seasonNumber,
            episodeNumber: episode_number,
            posterHref: still_path ? `https://image.tmdb.org/t/p/w227_and_h127_bestv2${still_path}` : '',
            description: {
                [language]: overview
            },
            title: {
                [language]: name
            }
        };
    });
}
