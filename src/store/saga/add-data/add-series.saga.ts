import { mapSeriesInfoDtoToSeries, mapSeriesInfoDtoToSeriesSeasons } from '../../utils/series.utils';
import { put } from 'redux-saga/effects';
import { updateOrAddMultipleSeriesAction, updateOrAddSeriesAction } from '../../reducers/series.reducer';
import { generateLinkForSeries, generateLinksForSeriesSeasonFromSeriesDto } from '../../utils/link.utils';
import { updateOrAddMultipleLinksAction } from '../../reducers/link.reducer';
import { SeriesInfoDto } from '../../../dto/series-info.dto';
import { updateOrAddMutlipleSeriesSeasonAction } from '../../reducers/series-season.reducer';
import { Logger } from '../../../shared/services/logger';

export function* addMultipleSeriesSaga(seriesInfo: SeriesInfoDto[]) {
    if (!seriesInfo || seriesInfo.length === 0) {
        Logger.error(`[addMultipleSeriesSaga] tried to add empty SeriesInfoDto`);
        return;
    }

    const series = seriesInfo.map(mapSeriesInfoDtoToSeries);
    yield put(updateOrAddMultipleSeriesAction(series));

    const links = seriesInfo.map(generateLinkForSeries);
    yield put(updateOrAddMultipleLinksAction(links));
}

export function* addSeriesSaga(seriesInfo: SeriesInfoDto) {
    if (!seriesInfo) {
        Logger.error(`[addSeriesSaga] tried to add empty SeriesInfoDto`);
        return;
    }

    const series = mapSeriesInfoDtoToSeries(seriesInfo);
    yield put(updateOrAddSeriesAction(series));

    const seasons = mapSeriesInfoDtoToSeriesSeasons(seriesInfo);
    yield put(updateOrAddMutlipleSeriesSeasonAction(seasons));

    const links = generateLinksForSeriesSeasonFromSeriesDto(seriesInfo);
    yield put(updateOrAddMultipleLinksAction(links));

}
