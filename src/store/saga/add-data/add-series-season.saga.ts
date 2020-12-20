import { put } from 'redux-saga/effects';
import { PortalSeriesSeasonDto } from '../../../dto/portal-series-season.dto';
import { generateLinksForSeriesSeasonDto } from '../../utils/link.utils';
import { updateOrAddMultipleLinksAction } from '../../reducers/link.reducer';
import { addMultipleEpisodesSaga } from './add-series-episode.saga';
import { Logger } from '../../../shared/services/logger';
import { SeriesSeason } from '../../models/series-season.model';

export function* addSeriesSeasonSaga(season: SeriesSeason, portalData: PortalSeriesSeasonDto) {
    if (!portalData || !season) {
        Logger.error('[addSeriesSeasonSaga] tried to add empty SeriesSeasonDto');
        return;
    }

    const seasonLinks = generateLinksForSeriesSeasonDto(season, portalData);
    yield put(updateOrAddMultipleLinksAction(seasonLinks));

    yield addMultipleEpisodesSaga(season.seriesKey, portalData.episodes);
}
