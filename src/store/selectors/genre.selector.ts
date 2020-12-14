import { StateModel } from '../models/state.model';
import { Genre } from '../models/genre.model';

export const getMultipleGenres = (state: StateModel, keys: Genre['key'][]): Genre[] => {
    return keys.map(key => state.genres[key]);
};
