import { createAction } from '@reduxjs/toolkit';

export const deleteSeriesAction = createAction<string>('series/deleteSeries');
