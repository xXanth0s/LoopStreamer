import { createAsyncThunk } from '@reduxjs/toolkit';
import SeriesEpisode from '../models/series-episode.model';
import { getSeriesEpisodeByKey } from '../selectors/series-episode.selector';
import { getSeriesByKey } from '../selectors/series.selector';
import { getPopupEndTimeForSeriesEpisode } from '../utils/series.utils';
import { thunkConfig } from '../types/thunk-config.type';

export const setTimestampForSeriesEpisode = createAsyncThunk<{ seriesEpisodeKey: SeriesEpisode['key']; isFinished: boolean; timestamp: number },
    { seriesEpisodeKey: SeriesEpisode['key']; timestamp: number }, thunkConfig>(
    'seriesEpisodes/',
    ((payload: { seriesEpisodeKey: SeriesEpisode['key']; timestamp: number }, thunkAPI) => {
        const { seriesEpisodeKey, timestamp } = payload;
        const state = thunkAPI.getState();
        const seriesEpisode = getSeriesEpisodeByKey(state, seriesEpisodeKey);
        const series = getSeriesByKey(state, seriesEpisode.seriesKey);

        const timeLeft = seriesEpisode.duration - timestamp;

        const timeWhenSeriesIsFinished = getPopupEndTimeForSeriesEpisode(series);

        const isFinished = timeLeft <= timeWhenSeriesIsFinished;

        return {
            seriesEpisodeKey,
            isFinished,
            timestamp,
        };
    }),
);
