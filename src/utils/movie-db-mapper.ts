import MovieDB from 'node-themoviedb';
import { getKeyForSeriesTitle } from '../store/utils/key.utils';
import { LANGUAGE } from '../store/enums/language.enum';
import Series from '../store/models/series.model';
import { mapLanguage } from './language-mapper';
import { MovieApi } from '../store/enums/movie-api.enum';

export function mapSeriesFromMovieDB(series: MovieDB.Objects.TVShow, activeLanguage: LANGUAGE): Series {
    const { original_name, id, overview, name, poster_path, original_language } = series;
    const seriesLanguage = mapLanguage(original_language);
    const key = getKeyForSeriesTitle(original_name);
    return {
        portalLinks: [],
        previewVideos: {},
        seasons: [],
        titles: {
            [activeLanguage]: name,
            [seriesLanguage]: original_name
        },
        descriptions: {
            [activeLanguage]: overview
        },
        posterHref: `https://image.tmdb.org/t/p/w330_and_h440_face/${poster_path}`,
        apiKeys: {
            [MovieApi.TMDB]: `${id}`,
        },
        key
    };

}
