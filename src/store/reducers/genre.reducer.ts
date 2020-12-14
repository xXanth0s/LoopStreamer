import { StateModel } from '../models/state.model';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Genre } from '../models/genre.model';

const initialState: StateModel['genres'] = {};

function addGenre(state: StateModel['genres'], { genre }: { genre: Genre }): void {
    const previousGenre = state[genre.key];
    if (previousGenre) {
        state[genre.key] = {
            ...previousGenre,
            ...genre,
            translations: {
                ...previousGenre.translations,
                ...genre.translations,
            }
        };
    } else {
        state[genre.key] = genre;
    }
}

function addMultipleGenres(state: StateModel['genres'], { genres }: { genres: Genre[] }) {
    genres.forEach(genre => addGenre(state, { genre }));
}

const { reducer, actions } = createSlice({
    name: 'genres',
    initialState,
    reducers: {
        addGenreAction: (state: StateModel['genres'], action: PayloadAction<{ genre: Genre }>) =>
            addGenre(state, action.payload),
        addMultipleGenresAction: (state: StateModel['genres'], action: PayloadAction<{ genres: Genre[] }>) =>
            addMultipleGenres(state, action.payload),
    }
});

export const {
    addGenreAction,
    addMultipleGenresAction
} = actions;

export const genreReducer = reducer;
