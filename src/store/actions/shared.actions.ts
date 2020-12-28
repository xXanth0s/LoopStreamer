import { createAction, PayloadAction } from '@reduxjs/toolkit';
import { LANGUAGE } from '../enums/language.enum';
import { SeriesSeason } from '../models/series-season.model';
import SeriesEpisode from '../models/series-episode.model';

export const appStartedAction = createAction<string>('global/AppStarted');

export const deleteSeriesAction = createAction<string>('series/deleteSeries');

export const startEpisodeAction = createAction<{ episodeKey: SeriesEpisode['key'], language?: LANGUAGE }>('app/startEpisode');

export const startNextEpisodeAction = createAction<{ episodeKey: string; userAction: boolean }>('video/startNextEpisode');

export const startPreviousEpisodeAction = createAction<string>('video/startPreviousEpisode');

export const continueAutoplayAction = createAction<string>('video/continueAutoPlay');


function test(t: PayloadAction) {

}
