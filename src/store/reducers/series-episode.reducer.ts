import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import SeriesEpisode from '../models/series-episode.model';
import { StateModel } from '../models/state.model';


const initialState: StateModel['seriesEpisodes'] = {};

const addSeriesEpisode = function (state: StateModel['seriesEpisodes'], seriesEpisode: SeriesEpisode): void {

    const oldEpisode = state[seriesEpisode.key];

    state[seriesEpisode.key] = {
        ...oldEpisode,
        ...seriesEpisode,
        portalLinks: {
            ...oldEpisode?.portalLinks,
            ...seriesEpisode.portalLinks,
        },
        providorLinks: {
            ...oldEpisode?.providorLinks,
            ...seriesEpisode.providorLinks,
        }
    };
};

const seriesEpisodesReducer = createSlice({
    name: 'seriesEpisodes',
    initialState,
    reducers: {
        addSeriesEpisodeAction: (state: StateModel['seriesEpisodes'], action: PayloadAction<SeriesEpisode>) => addSeriesEpisode(state, action.payload),
    },
});

export const {
    addSeriesEpisodeAction
} = seriesEpisodesReducer.actions


export default seriesEpisodesReducer;



