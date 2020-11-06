import { createAction } from '@reduxjs/toolkit';

export const deleteSeriesAction = createAction<string>('series/deleteSeries');

export const startEpisodeAction = createAction<string>('app/startEpisode');

export const startNextEpisodeAction = createAction<{ episodeKey: string, userAction: boolean }>('video/startNextEpisode');

export const startPreviousEpisodeAction = createAction<string>('video/startPreviousEpisode');

export const continueAutoplayAction = createAction<string>('video/continueAutoPlay');



