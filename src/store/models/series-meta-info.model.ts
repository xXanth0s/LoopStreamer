import { LANGUAGE } from '../enums/language.enum';
import { KeyModel } from './key-model.interface';
import { MovieApi } from '../enums/movie-api.enum';

export interface SeriesMetaInfo extends KeyModel<string> {
    titles: Partial<Record<LANGUAGE, string>>;
    apiKeys: Partial<Record<MovieApi, string>>;
    posterHref: string;
}
