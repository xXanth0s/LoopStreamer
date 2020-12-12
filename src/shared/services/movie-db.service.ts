import { injectable } from 'inversify';
import MovieDB from 'node-themoviedb';
import { Logger } from './logger';
import { mapSeriesFromMovieDB } from '../../utils/movie-db-mapper';
import Series from '../../store/models/series.model';
import { LANGUAGE } from '../../store/enums/language.enum';

@injectable()
export class MovieDBService {

    public static async getPopularSeries(language: LANGUAGE): Promise<Series[]> {
        let series: MovieDB.Objects.TVShow[] = [];
        const client = MovieDBService.getClient(language);
        try {

            const result = await client.tv.getPopular({});
            series = result.data.results;
        } catch (error) {
            Logger.error('[MovieDDService->getPopularSeries] error occurred', error);
        }

        return series.map((series) => mapSeriesFromMovieDB(series, language));
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
