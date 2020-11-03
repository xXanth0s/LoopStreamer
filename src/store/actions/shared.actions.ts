import { createAction } from '@reduxjs/toolkit';
import { PORTALS } from '../enums/portals.enum';

export const deleteSeriesAction = createAction<string>('series/deleteSeries');

export const startEpisodeAction = createAction<{episodeKey: string, portalKey?: PORTALS}>('app/startEpisode');


