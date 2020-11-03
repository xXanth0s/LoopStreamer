import { setActivePortalForAppAction, toggleSelectedSeriesForAppAction } from '../reducers/app-control-state.reducer';
import { getSeriesService } from '../../background/container/container.helper';
import { select } from 'redux-saga/effects';
import { StateModel } from '../models/state.model';

export function* loadSeriesForPortal(action: ReturnType<typeof setActivePortalForAppAction>) {
    if (action.payload) {
        const seriesService = getSeriesService();
        yield seriesService.updateAllSeriesForPortal(action.payload);
    }
}


export function* loadDetailedSeriesInformation(action: ReturnType<typeof toggleSelectedSeriesForAppAction>) {
    const state: StateModel = yield select();
    const { selectedSeries, activePortal } = state.appControlState;
    if (!selectedSeries) {
        return;
    }

    const seriesService = getSeriesService();

    yield seriesService.updateSeriesForPortal(action.payload, activePortal);
}



