import { put } from 'redux-saga/effects';
import { PortalSeriesSeasonDto } from '../../../dto/portal-series-season.dto';
import { generateLinksForSeriesSeasonDto } from '../../utils/link.utils';
import { updateOrAddMultipleLinksAction } from '../../reducers/link.reducer';
import { addMultipleEpisodesSaga } from './add-series-episode.saga';
import { Logger } from '../../../shared/services/logger';

export function* addSeriesSeasonSaga(seasonData: PortalSeriesSeasonDto) {
    if (!seasonData) {
        Logger.error('[addSeriesSeasonSaga] tried to add empty SeriesSeasonDto');
        return;
    }

    const seasonLinks = generateLinksForSeriesSeasonDto(seasonData);
    yield put(updateOrAddMultipleLinksAction(seasonLinks));

    yield addMultipleEpisodesSaga(seasonData.episodes);
}
