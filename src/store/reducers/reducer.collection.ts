import { controlStateSlice } from './control-state.reducer';
import { appControlStateSlice } from './app-control-state.reducer';
import { optionsSlice } from './options.reducer';
import { providorsSlice } from './providors.reducer';
import seriesSlice from './series.reducer';
import portalsSlice from './portals.reducer';
import seriesSeasonsReducer from './series-season.reducer';
import seriesEpisodesReducer from './series-episode.reducer';
import linkSlice from './link.reducer';
import { genreReducer } from './genre.reducer';
import { seriesMetaInfoReducer } from './series-meta-info.reducer';
import { ReducersMapObject } from 'redux';
import { StateModel } from '../models/state.model';
import { watchedSeriesReducer } from './watchedSeries.reducer';

export const storeReducers: ReducersMapObject<StateModel> = {
    appControlState: appControlStateSlice.reducer,
    controlState: controlStateSlice.reducer,
    genres: genreReducer,
    links: linkSlice.reducer,
    options: optionsSlice.reducer,
    portals: portalsSlice.reducer,
    providors: providorsSlice.reducer,
    series: seriesSlice.reducer,
    seriesEpisodes: seriesEpisodesReducer.reducer,
    seriesMetaInfos: seriesMetaInfoReducer,
    seriesSeasons: seriesSeasonsReducer.reducer,
    watchedSeries: watchedSeriesReducer,
};
