import MovieDB from 'node-themoviedb';
import { getKeyForSeriesTitle } from '../store/utils/key.utils';
import { SeriesDto } from '../app/src/data/series-dto.model';

export function mapSeriesFromMovieDB(series: MovieDB.Objects.TVShow): SeriesDto {
    const { original_name, backdrop_path, id, overview, popularity, name, poster_path, genre_ids } = series;

    const key = getKeyForSeriesTitle(original_name);
    return {
        title: name,
        description: overview,
        actors: [],
        poster: `https://image.tmdb.org/t/p/w330_and_h440_face/${poster_path}`,
        backdropUrl: `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${backdrop_path}`,
        movieDBKey: id,
        originalTitle: original_name,
        rating: popularity,
        genres: [],
        key
    };

}
