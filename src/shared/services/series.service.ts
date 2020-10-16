import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../constants/SHARED_TYPES';
import { StoreService } from './store.service';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { updateOrAddSeriesAction } from '../../store/reducers/series.reducer';
import { updateOrAddSeriesSeasonAction } from '../../store/reducers/series-season.reducer';
import Series from '../../store/models/series.model';
import { getSeriesByKey } from '../../store/selectors/series.selector';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import SeriesEpisode from '../../store/models/series-episode.model';
import { updateOrAddSeriesEpisode, updateOrAddSeriesEpisodeAction } from '../../store/reducers/series-episode.reducer';
import { getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';
import {
    mapSeriesEpisodeDtoToSeriesEpisode,
    mapSeriesInfoDtoToSeriesSeasons,
    mapsSeriesInfoDtoToSeries
} from '../../store/utils/series.utils';

@injectable()
export class SeriesService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    public addSeriesToStore(seriesInfo: SeriesInfoDto): Series {
        const series = mapsSeriesInfoDtoToSeries(seriesInfo);
        this.store.dispatch(updateOrAddSeriesAction(series));

        const seriesSeasons = mapSeriesInfoDtoToSeriesSeasons(seriesInfo);
        seriesSeasons.forEach(season => this.store.dispatch(updateOrAddSeriesSeasonAction(season)));

        return this.store.selectSync(getSeriesByKey, series.key);
    }

    public addSeriesEpisodesToStore(episodeDtos: SeriesEpisodeDto[]): SeriesEpisode[] {
        const episodes = episodeDtos.map(mapSeriesEpisodeDtoToSeriesEpisode);

        episodes.forEach(episode => this.store.dispatch(updateOrAddSeriesEpisodeAction(episode)));

        return episodes.map(({ key }: SeriesEpisode) => this.store.selectSync(getSeriesEpisodeByKey, key));
    }
}
