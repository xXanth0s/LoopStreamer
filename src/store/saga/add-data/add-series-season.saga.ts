import { PortalSeriesSeasonDto } from '../../../dto/portal-series-season.dto';
import { mapSeriesSeasonDtoToSeriesSeason } from '../../utils/series.utils';
import { put } from 'redux-saga/effects';
import { updateOrAddSeriesSeasonAction } from '../../reducers/series-season.reducer';
import { generateLinksForSeriesSeasonDto } from '../../utils/link.utils';
import { updateOrAddMultipleLinksAction } from '../../reducers/link.reducer';
import { addMultipleEpisodesSaga } from './add-series-episode.saga';
import { Logger } from '../../../shared/services/logger';

export function* addSeriesSeasonSaga(seasonData: PortalSeriesSeasonDto) {
    if (!seasonData) {
        Logger.error(`[addSeriesSeasonSaga] tried to add empty SeriesSeasonDto`);
        return;
    }

    const convertedSeason = mapSeriesSeasonDtoToSeriesSeason(seasonData);
    yield put(updateOrAddSeriesSeasonAction(convertedSeason));

    const seasonLinks = generateLinksForSeriesSeasonDto(seasonData);
    yield put(updateOrAddMultipleLinksAction(seasonLinks));

    yield addMultipleEpisodesSaga(seasonData.episodes);
}
