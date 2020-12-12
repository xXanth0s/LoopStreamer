import { put } from 'redux-saga/effects';
import { generateLinksForSeriesSeasonFromSeriesDto } from '../../utils/link.utils';
import { updateOrAddMultipleLinksAction } from '../../reducers/link.reducer';
import { PortalSeriesInfoDto } from '../../../dto/portal-series-info.dto';
import { Logger } from '../../../shared/services/logger';


export function* addSeriesSaga(seriesInfo: PortalSeriesInfoDto, seriesKey: string) {
    if (!seriesInfo) {
        Logger.error(`[addSeriesSaga] tried to add empty SeriesInfoDto`);
        return;
    }

    const links = generateLinksForSeriesSeasonFromSeriesDto(seriesInfo, seriesKey);
    yield put(updateOrAddMultipleLinksAction(links));

}
