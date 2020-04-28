import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Series from '../models/series.model';
import {mapArrayToObject} from '../utils/selector.utils';
import SeriesEpisodeInfo from '../models/series-episode-info.model';

// const initialState: {[key: string]: Series} = seriesMock;
const initialState: {[key: string]: Series} = {
    "family-guy": {
        "endTimeConfigured": false,
        "imageHref": "https://bs.to/public/images/cover/82.jpg",
        "key": "family-guy",
        "lastEpisodeWatched": {
            "episode": 2,
            "hasNextEpisode": true,
            hasPreviousEpisode: false,
            "portalHref": "https://bs.to/serie/Family-Guy/1/2-Der-verhaengnisvolle-Autounfall/de/vivo",
            providorHref: 'https://vivo.sx/aeb1a3f31f',
            "season": 1,
            "seriesKey": "Family-Guy"
        },
        "scipEndTime": 0,
        "scipStartTime": 0,
        "startTimeConfigured": false,
        "title": "Family Guy"
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

    const lastEpisodeWatched = {
        ...oldSeriesObject.lastEpisodeWatched,
        ...series.lastEpisodeWatched
    };

    // @ts-ignore
    state[series.key] = {
        ...oldSeriesObject,
        ...series,
        lastEpisodeWatched
    };

    return state;
};


const updateSeriesEpisode = (state: {[key: string]: Series}, episode: SeriesEpisodeInfo): {[key: string]: Series}  => {
    const series = state[episode.seriesKey];
    if(series){
        series.lastEpisodeWatched = {
            ...series.lastEpisodeWatched,
            ...episode
        };
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

const seriesSlice = createSlice({
    name: 'series',
    initialState,
    reducers: {
        initSeriesAction: (state: {[key: string]: Series}, action: PayloadAction<Series[]>) => initSeries(state, action.payload),
        removeSeriesAction: (state: {[key: string]: Series}, action: PayloadAction<Series['key']>) => removeSeries(state, action.payload),
        updateSeriesAction: (state: {[key: string]: Series}, action: PayloadAction<Series>) => updateSeries(state, action.payload),
        updateSeriesEpisodeAction: (state: {[key: string]: Series}, action: PayloadAction<SeriesEpisodeInfo>) => updateSeriesEpisode(state, action.payload),
        setStartTimeForSeriesAction: (state: {[key: string]: Series}, action: PayloadAction<{key: Series['key'], scipStartTime?: Series['scipStartTime']}>) => setStartTimeForSeries(state, action.payload.key, action.payload.scipStartTime),
        setEndTimeForSeriesAction: (state: {[key: string]: Series}, action: PayloadAction<{key: Series['key'], scipEndTime?: Series['scipStartTime']}>) => setEndTimeForSeries(state, action.payload.key, action.payload.scipEndTime),
        resetSeriesAction: (state: {[key: string]: Series}, action: PayloadAction<Series['key']>) => resetSeries(state, action.payload),
    }
});

export const {
    initSeriesAction,
    removeSeriesAction,
    updateSeriesAction,
    resetSeriesAction,
    updateSeriesEpisodeAction,
    setStartTimeForSeriesAction,
    setEndTimeForSeriesAction,
} = seriesSlice.actions;

export default seriesSlice;


const generateEmptySeries = function (): Series {
    return {
        key: '',
        lastEpisodeWatched: {
            seriesKey: '',
            hasNextEpisode: false,
            hasPreviousEpisode: false,
            episode: 0,
            season: 0
        },
        scipStartTime: 0,
        scipEndTime: 0,
        startTimeConfigured: false,
        endTimeConfigured: false,
        imageHref: '',
        title: ''
    }
};


