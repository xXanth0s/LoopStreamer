import { createAction } from '@reduxjs/toolkit';

export const deleteSeriesAction = createAction<string>('series/deleteSeries');

export const startEpisodeAction = createAction<string>('app/startEpisode');


