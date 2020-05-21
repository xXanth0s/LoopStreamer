import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateModel } from '../models/state.model';
import { SeriesSeason } from '../models/series-season.model';
import { addSeriesEpisodeAction } from './series-episode.reducer';
import SeriesEpisode from '../models/series-episode.model';
import { getKeyForSeriesSeason } from '../utils/key.utils';
import { PORTALS } from '../enums/portals.enum';


const initialState: StateModel['seriesSeasons'] = {};

const addSeriesSeason = function (state: StateModel['seriesSeasons'], seriesSeason: SeriesSeason): StateModel['seriesSeasons'] {

    const oldSeasonObject = state[seriesSeason.key];

    return {
        ...state,
        [seriesSeason.key]: {
            ...oldSeasonObject,
            ...seriesSeason,
            portalLinks: {
                ...oldSeasonObject?.portalLinks,
                ...seriesSeason.portalLinks,
            }
        }
    };
};

const addSeriesEpisode = function (state: StateModel['seriesSeasons'], seriesEpisode: SeriesEpisode): void {
    const seasonKey = getKeyForSeriesSeason(seriesEpisode.seriesKey, seriesEpisode.season);
    const season = state[seasonKey];
    if(season && !season.episodes.includes(seriesEpisode.key)) {
        state[seasonKey].episodes.push(seriesEpisode.key);
    }
}

const seriesSeasonsReducer = createSlice({
    name: 'seriesSeasons',
    initialState,
    reducers: {
        addSeriesSeasonAction: (state: StateModel['seriesSeasons'], action: PayloadAction<SeriesSeason>) => addSeriesSeason(state, action.payload),
    },
    extraReducers: {
        [addSeriesEpisodeAction.type]: (state: StateModel['seriesSeasons'], action: PayloadAction<SeriesEpisode>) => addSeriesEpisode(state, action.payload)
    }
});

export const {
    addSeriesSeasonAction
} = seriesSeasonsReducer.actions


export default seriesSeasonsReducer;


const getEmptySeriesSeason = (): SeriesSeason => {
    return {
        episodes: [],
        seriesKey: '',
        key: '',
        portalLinks: {} as {[key in PORTALS]: string },
        seasonNumber: -1
    }
}
