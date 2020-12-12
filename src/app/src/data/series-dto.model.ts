export interface SeriesDto {
    key: string;
    movieDBKey: number;
    poster: string;
    backdropUrl?: string;
    title: string;
    originalTitle: string;
    rating: number;
    description: string;
    trailerUrl?: string;
    actors: string[];
    genres: string[];
}
