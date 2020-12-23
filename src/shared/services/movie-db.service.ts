import { injectable } from 'inversify';
import MovieDB, { Responses } from 'node-themoviedb';
import { IncomingHttpHeaders } from 'http';
import { Logger } from './logger';
import {
    mapGenreFromMovieDB,
    mapSeasonEpisodesFromMovieDB,
    mapSeasonFromMovieDB,
    mapSeriesFromMovieDB,
    mapSeriesMetaInfoFromMovieDB,
    orderByMovieDBPopularity
} from '../../utils/movie-db-mapper';
import Series from '../../store/models/series.model';
import { LANGUAGE } from '../../store/enums/language.enum';
import { SeriesSeason } from '../../store/models/series-season.model';
import SeriesEpisode from '../../store/models/series-episode.model';
import { MovieApi } from '../../store/enums/movie-api.enum';
import { Genre } from '../../store/models/genre.model';
import { SeriesMetaInfo } from '../../store/models/series-meta-info.model';

type MovieDbResponse<T> = { data: T; headers: IncomingHttpHeaders }

@injectable()
export class MovieDBService {
    public static async getPopularSeries(language: LANGUAGE): Promise<SeriesMetaInfo[]> {
        let series: MovieDB.Objects.TVShow[] = [];
        const client = MovieDBService.getClient(language);
        try {
            const results = await Promise.all<MovieDbResponse<Responses.TV.GetPopular>>([
                client.tv.getPopular({ query: { page: 1 } }),
                client.tv.getPopular({ query: { page: 2 } }),
                client.tv.getPopular({ query: { page: 3 } }),
            ]);
            series = results.flatMap(data => data.data.results);
        } catch (error) {
            Logger.error('[MovieDDService->getPopularSeries] error occurred', error);
        }

        return series.map((series) => mapSeriesMetaInfoFromMovieDB(series, language));
    }

    public static async getTopRatedSeries(language: LANGUAGE): Promise<SeriesMetaInfo[]> {
        let series: MovieDB.Objects.TVShow[] = [];
        const client = MovieDBService.getClient(language);
        try {
            const results = await Promise.all<MovieDbResponse<Responses.TV.GetTopRated>>([
                client.tv.getTopRated({ query: { page: 1 } }),
                client.tv.getTopRated({ query: { page: 2 } }),
                client.tv.getTopRated({ query: { page: 3 } }),
            ]);
            series = results.flatMap(data => data.data.results);
            series = orderByMovieDBPopularity(series);
        } catch (error) {
            Logger.error('[MovieDDService->getTopRatedSeries] error occurred', error);
        }

        return series.map((series) => mapSeriesMetaInfoFromMovieDB(series, language));
    }

    public static async getAiringTodaySeries(language: LANGUAGE): Promise<SeriesMetaInfo[]> {
        let series: MovieDB.Objects.TVShow[] = [];
        const client = MovieDBService.getClient(language);
        try {
            const results = await Promise.all<MovieDbResponse<Responses.TV.GetAiringToday>>([
                client.tv.getAiringToday({ query: { page: 1 } }),
                client.tv.getAiringToday({ query: { page: 2 } }),
                client.tv.getAiringToday({ query: { page: 3 } }),
            ]);
            series = results.flatMap(data => data.data.results);
            series = orderByMovieDBPopularity(series);
        } catch (error) {
            Logger.error('[MovieDDService->getAiringTodaySeries] error occurred', error);
        }

        return series.map((series) => mapSeriesMetaInfoFromMovieDB(series, language));
    }

    public static async getSimilarSeries(movieDbId: string, language: LANGUAGE): Promise<SeriesMetaInfo[]> {
        let series: MovieDB.Objects.TVShow[] = [];
        const client = MovieDBService.getClient(language);
        try {
            const results = await Promise.all<MovieDbResponse<Responses.TV.GetSimilarTVShows>>([
                client.tv.getSimilarTVShows({ pathParameters: { tv_id: movieDbId }, query: { page: 1 } }),
                client.tv.getSimilarTVShows({ pathParameters: { tv_id: movieDbId }, query: { page: 2 } }),
                client.tv.getSimilarTVShows({ pathParameters: { tv_id: movieDbId }, query: { page: 3 } }),
            ]);
            // @ts-ignore
            series = results.flatMap(data => data.data.results);
            series = orderByMovieDBPopularity(series);
            debugger
        } catch (error) {
            Logger.error('[MovieDDService->getSimilarSeries] error occurred', error);
        }

        return series.map((series) => mapSeriesMetaInfoFromMovieDB(series, language));
    }

    public static async getDetailedSeriesInformation(movieDbId: string, language: LANGUAGE): Promise<[ Series, SeriesSeason[], SeriesEpisode[] ]> {
        const client = MovieDBService.getClient(language);
        let videoUrl: string;
        let series: Responses.TV.GetDetails;
        try {
            const [ seriesResponse, video ]: [ MovieDbResponse<Responses.TV.GetDetails>, string ] = await Promise.all([
                client.tv.getDetails({ pathParameters: { tv_id: movieDbId } }),
                MovieDBService.getVideo(movieDbId, language),
            ]);

            series = seriesResponse.data;
            videoUrl = video;
        } catch (error) {
            Logger.error('[MovieDDService->getDetailedSeriesInformation] error occurred', error);
            return null;
        }

        if (!series) {
            return null;
        }

        const mappedSeries = mapSeriesFromMovieDB(series, language, videoUrl);

        const seasonData = await Promise.all(
            series.seasons.filter(season => season.season_number !== 0)
                .map(season => MovieDBService.getSeasonInfo(mappedSeries, `${season.season_number}`, language)),
        );

        const mappedSeasons = seasonData.map(([ season, episodes ]) => season);
        const mappedEpisodes = seasonData.flatMap(([ season, episodes ]) => episodes);

        return [ mappedSeries, mappedSeasons, mappedEpisodes ];
    }

    public static async getSeasonInfo(series: Series, seasonNumber: string, language: LANGUAGE): Promise<[ SeriesSeason, SeriesEpisode[] ]> {
        const client = MovieDBService.getClient(language);
        let season: Responses.TV.Season.GetDetails;
        try {
            const seasonResponse = await client.tv.season.getDetails({
                pathParameters: {
                    tv_id: series.apiKeys[MovieApi.TMDB],
                    season_number: seasonNumber,
                },
            });
            season = seasonResponse.data;
        } catch (error) {
            Logger.error('[MovieDDService->getSeasonInfo] error occurred', error);
            return null;
        }

        const mappedSeason = mapSeasonFromMovieDB(season, series.key);
        const mappedEpisodes = mapSeasonEpisodesFromMovieDB(season, series.key, language);
        return [ mappedSeason, mappedEpisodes ];
    }

    public static async loadGenres(language: LANGUAGE): Promise<Genre[]> {
        const client = MovieDBService.getClient(language);
        let genres = [];
        try {
            const apiGenres = await client.genre.getTVList();
            genres = apiGenres.data.genres.map(genre => mapGenreFromMovieDB(genre, language));
        } catch (error) {
            Logger.error('[MovieDDService->loadGenres] error occurred', error);
        }

        return genres;
    }

    private static async getVideo(movieDbId: string, language: LANGUAGE): Promise<string> {
        const client = MovieDBService.getClient(language);
        let videoUrl = '';
        try {
            const videoResponse = await client.tv.getVideos({ pathParameters: { tv_id: movieDbId } });

            const video = videoResponse.data.results
                .filter(video => video.site.toLowerCase() === 'youtube')
                .find(video => video.type === 'Trailer' || video.type === 'Teaser');
            videoUrl = video?.key;
        } catch (error) {
            Logger.error('[MovieDDService->getVideo] error occurred', error);
            return '';
        }

        if (!videoUrl && language !== LANGUAGE.ENGLISH) {
            return MovieDBService.getVideo(movieDbId, LANGUAGE.ENGLISH);
        }

        return videoUrl;
    }

    private static getClient(usedLanguage: LANGUAGE): MovieDB {
        const language = MovieDBService.mapLanguage(usedLanguage);
        return new MovieDB('daa63aa8627cfd8c6ab8733fa2561153', { language });
    }

    private static mapLanguage(language: LANGUAGE): string {
        switch (language) {
            case LANGUAGE.ENGLISH:
                return 'en-US';
            case LANGUAGE.GERMAN:
                return 'de-DE';
            default:
                return 'en-US';
        }
    }
}
