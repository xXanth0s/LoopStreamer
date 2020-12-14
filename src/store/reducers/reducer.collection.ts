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

export const storeReducers = {
    controlState: controlStateSlice.reducer,
    appControlState: appControlStateSlice.reducer,
    options: optionsSlice.reducer,
    providors: providorsSlice.reducer,
    series: seriesSlice.reducer,
    portals: portalsSlice.reducer,
    seriesSeasons: seriesSeasonsReducer.reducer,
    seriesEpisodes: seriesEpisodesReducer.reducer,
    links: linkSlice.reducer,
    genres: genreReducer,
};
