import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../../shared/services/store.service';
import { MovieDBService } from '../../../shared/services/movie-db.service';
import { mapSeriesFromMovieDB } from '../../../utils/movie-db-mapper';
import { SeriesDto } from '../data/series-dto.model';

@injectable()
export class SeriesService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(SHARED_TYPES.MovieDBService) private readonly movieDBService: MovieDBService) {
    }

    public async getPopularSeries(): Promise<SeriesDto[]> {
        const result = await this.movieDBService.getPopularSeries();
        return result.results.map(mapSeriesFromMovieDB);
    }

}
