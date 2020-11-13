import { setSelectedSeasonForAppAction } from '../reducers/app-control-state.reducer';
import { StateModel } from '../models/state.model';
import { call, put, select } from 'redux-saga/effects';
import { getSeriesSeasonByKey } from '../selectors/series-season.selector';
import { getSeriesByKey } from '../selectors/series.selector';
import { PORTALS } from '../enums/portals.enum';
import { getPortalController } from '../../background/container/container.utils';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { mapSeriesEpisodeDtoToSeriesEpisode } from '../utils/series.utils';
import { updateOrAddMultipleSeriesEpisodeAction } from '../reducers/series-episode.reducer';
import { SeriesSeason } from '../models/series-season.model';

export function* loadSeasonInformationSaga(action: ReturnType<typeof setSelectedSeasonForAppAction>) {
    const seasonKey = action.payload;
    if (!seasonKey) {
        return;
    }

    const state: StateModel = yield select();
    let portal = state.appControlState.activePortal;
    if (!portal) {
        const season = getSeriesSeasonByKey(state, seasonKey);
        const series = getSeriesByKey(state, season.seriesKey);

        portal = series.lastUsedPortal;
    }

    yield loadSeasonInformationForPortal(action.payload, portal);
}

export function* loadSeasonInformationForPortal(seasonKey: SeriesSeason['key'], portalKey: PORTALS) {
    const portalController = getPortalController();
    const seasonEpisodes: SeriesEpisodeDto[] = yield call([ portalController, portalController.getEpisodesForSeason ], seasonKey, portalKey);
    if (seasonEpisodes && seasonEpisodes.length > 0) {
        const episodes = seasonEpisodes.map(mapSeriesEpisodeDtoToSeriesEpisode);

        yield put(updateOrAddMultipleSeriesEpisodeAction(episodes));

        return true;
    }

    return false;
}
