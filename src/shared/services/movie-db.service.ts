import { injectable } from 'inversify';
import MovieDB from 'node-themoviedb';
import { Logger } from './logger';

@injectable()
export class MovieDBService {

    private readonly movieDBClient = new MovieDB('daa63aa8627cfd8c6ab8733fa2561153', { language: 'de-DE' });

    public async getPopularSeries(): Promise<MovieDB.Responses.TV.GetPopular> {
        try {
            const result = await this.movieDBClient.tv.getPopular({});
            return result.data;
        } catch (error) {
            Logger.error('[MovieDDService->getPopularSeries] error occurred', error);
        }

        return null;
    }
}
