import { createAction } from '@reduxjs/toolkit';
import { Series } from '../../store/models/series.model';
import { SeriesEpisode } from '../../store/models/series-episode.model';

export enum SkipTimeType {
    StartTime = 'startTime',
    EndTime = 'endTime'
}

export const setCurrentSkipTimeForSeries = createAction<{episodeKey: SeriesEpisode['key']; type: SkipTimeType}>('series/setCurrentSkipTime');
