import { createAction } from '@reduxjs/toolkit';
import { LANGUAGE } from '../enums/language.enum';
import { SeriesSeason } from '../models/series-season.model';

export const deleteSeriesAction = createAction<string>('series/deleteSeries');

export const startEpisodeAction = createAction<string>('app/startEpisode');

export const userChangedLanguageAction = createAction<{ selectedLanguage: LANGUAGE, seriesSeasonKey: SeriesSeason['key'] }>('app/changedLanguage');

export const startNextEpisodeAction = createAction<{ episodeKey: string, userAction: boolean }>('video/startNextEpisode');

export const startPreviousEpisodeAction = createAction<string>('video/startPreviousEpisode');

export const continueAutoplayAction = createAction<string>('video/continueAutoPlay');




