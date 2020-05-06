import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Series from '../models/series.model';
import {mapArrayToObject} from '../utils/selector.utils';
import SeriesEpisode from '../models/series-episode.model';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { getKeyForSeriesSeason, getKeyForSeriesTitle } from '../utils/key.utils';
import { addSeriesSeasonAction } from './series-season.reducer';
import { StateModel } from '../models/state.model';
import { SeriesSeasonDto } from '../../dto/series-season.dto';
import { SeriesSeason } from '../models/series-season.model';

// const initialState: {[key: string]: Series} = seriesMock;
const initialState: StateModel['series'] = {
    'family-guy': {
        endTimeConfigured: false,
        posterHref: "https://bs.to/public/images/cover/82.jpg",
        key: "family-guy",
        scipEndTime: 0,
        scipStartTime: 0,
        startTimeConfigured: false,
        title: "Family Guy",
        seasons: []
    }
};

const removeSeries = (state:{[key: string]: Series}, key: Series['key']): {[key: string]: Series} => {
    delete state[key];
    return state;
};

const updateSeries = (state: {[key: string]: Series}, series: Partial<Series>): {[key: string]: Series}  => {
    // @ts-ignore
    let oldSeriesObject = state[series.key];
    if(!oldSeriesObject) {
        oldSeriesObject = generateEmptySeries();
    }

    // @ts-ignore
    state[series.key] = {
        ...oldSeriesObject,
        ...series,
    };

    return state;
};


const updateSeriesEpisode = (state: {[key: string]: Series}, episode: SeriesEpisode): {[key: string]: Series}  => {
    const series = state[episode.seriesKey];
    if(series){
    }
    return state
};

const resetSeries = (state: {[key: string]: Series}, key:  Series['key']): {[key: string]: Series}  => {
    const series = state[key];
    state[key] = {
        ...series,
        endTimeConfigured: false,
        lastEpisodeWatched: undefined,
        startTimeConfigured: false,
        scipEndTime: 0,
        scipStartTime: 0
    };
    return state;
};

const setStartTimeForSeries = (state: {[key: string]: Series}, key:  Series['key'], scipStartTime?: Series['scipStartTime']): {[key: string]: Series}  => {
    const series = state[key];
    state[key] = {
        ...series,
        startTimeConfigured: true,
        scipStartTime
    };
    return state;
};

const setEndTimeForSeries = (state: {[key: string]: Series}, key:  Series['key'], scipEndTime?: Series['scipStartTime']): {[key: string]: Series}  => {
    const series = state[key];
    state[key] = {
        ...series,
        scipEndTime,
        endTimeConfigured: true
    };
    return state;
};

const initSeries = (state: { [key: string]: Series }, payload: Series[]): { [key: string]: Series } => {
    return mapArrayToObject(payload, 'key');
};

function addSeries(state: {[key: string]: Series}, seriesInfo: SeriesInfoDto): {[key: string]: Series} {
    const key = getKeyForSeriesTitle(seriesInfo.title);
    let oldSeries = state[key];
    if(!oldSeries) {
        oldSeries = {
            ...generateEmptySeries(),
            key
        }
    }

    const title = seriesInfo.title ? seriesInfo.title : oldSeries.title;
    const posterHref = seriesInfo.posterHref ? seriesInfo.posterHref : oldSeries.posterHref;

    return {
        ...state,
        [key]: {
            ...oldSeries,
            posterHref,
            title
        }

    }
    return undefined;
}

const addSeriesSeason = (state: StateModel['series'], seriesSeason: SeriesSeason): void => {
    const series = state[seriesSeason.seriesKey];
    if(series && !series?.seasons.includes(seriesSeason.key)) {
        series.seasons.push(seriesSeason.key);
    }
}

const seriesSlice = createSlice({
    name: 'series',
    initialState,
    reducers: {
        removeSeriesAction: (state: {[key: string]: Series}, action: PayloadAction<Series['key']>) => removeSeries(state, action.payload),
        updateSeriesAction: (state: {[key: string]: Series}, action: PayloadAction<Series>) => updateSeries(state, action.payload),
        updateSeriesEpisodeAction: (state: {[key: string]: Series}, action: PayloadAction<SeriesEpisode>) => updateSeriesEpisode(state, action.payload),
        setStartTimeForSeriesAction: (state: {[key: string]: Series}, action: PayloadAction<{key: Series['key'], scipStartTime?: Series['scipStartTime']}>) => setStartTimeForSeries(state, action.payload.key, action.payload.scipStartTime),
        setEndTimeForSeriesAction: (state: {[key: string]: Series}, action: PayloadAction<{key: Series['key'], scipEndTime?: Series['scipStartTime']}>) => setEndTimeForSeries(state, action.payload.key, action.payload.scipEndTime),
        resetSeriesAction: (state: {[key: string]: Series}, action: PayloadAction<Series['key']>) => resetSeries(state, action.payload),
        addSeriesAction: (state: {[key: string]: Series}, action: PayloadAction<SeriesInfoDto>) => addSeries(state, action.payload),
    },
    extraReducers: {
        [addSeriesSeasonAction.type]: (state: StateModel['series'], action: PayloadAction<SeriesSeason>) => addSeriesSeason(state, action.payload),
    }
});

export const {
    removeSeriesAction,
    updateSeriesAction,
    resetSeriesAction,
    updateSeriesEpisodeAction,
    setStartTimeForSeriesAction,
    setEndTimeForSeriesAction,
    addSeriesAction
} = seriesSlice.actions;

export default seriesSlice;


const generateEmptySeries = function (): Series {
    return {
        key: '',
        scipStartTime: 0,
        scipEndTime: 0,
        startTimeConfigured: false,
        endTimeConfigured: false,
        posterHref: '',
        title: '',
        seasons: []
    }
};


