import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../constants/SHARED_TYPES';
import { StoreService } from './store.service';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { updateOrAddMultipleSeriesAction, updateOrAddSeriesAction } from '../../store/reducers/series.reducer';
import { updateOrAddSeriesSeasonAction } from '../../store/reducers/series-season.reducer';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { updateOrAddSeriesEpisodeAction } from '../../store/reducers/series-episode.reducer';
import {
    mapSeriesEpisodeDtoToSeriesEpisode,
    mapSeriesInfoDtoToSeries,
    mapSeriesInfoDtoToSeriesSeasons
} from '../../store/utils/series.utils';

@injectable()
export class SeriesService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    public addMultipleSeriesToStore(seriesInfo: SeriesInfoDto[]): void {
        const series = seriesInfo.map(mapSeriesInfoDtoToSeries);

        this.store.dispatch(updateOrAddMultipleSeriesAction(series));
    }

    public addSeriesToStore(seriesInfo: SeriesInfoDto): void {
        const series = mapSeriesInfoDtoToSeries(seriesInfo);
        this.store.dispatch(updateOrAddSeriesAction(series));

        if (seriesInfo.seasonsLinks) {
            const seriesSeasons = mapSeriesInfoDtoToSeriesSeasons(seriesInfo);
            seriesSeasons.forEach(season => this.store.dispatch(updateOrAddSeriesSeasonAction(season)));
        }
    }

    public addSeriesEpisodesToStore(episodeDtos: SeriesEpisodeDto[]): void {
        const episodes = episodeDtos.map(mapSeriesEpisodeDtoToSeriesEpisode);

        episodes.forEach(episode => this.store.dispatch(updateOrAddSeriesEpisodeAction(episode)));
    }
}
