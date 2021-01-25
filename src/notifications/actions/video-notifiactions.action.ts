import { createAction } from '@reduxjs/toolkit';
import { Series } from '../../store/models/series.model';

export const setCurrentSkipTimeForSeries = createAction<{seriesKey: Series['key']}>('series/setCurrentSkipTime');
