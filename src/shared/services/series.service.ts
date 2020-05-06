import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../constants/SHARED_TYPES';
import { StoreService } from './store.service';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { getKeyForSeriesEpisode, getKeyForSeriesSeason, getKeyForSeriesTitle } from '../../store/utils/key.utils';
import { addSeriesAction } from '../../store/reducers/series.reducer';
import { addSeriesSeasonAction } from '../../store/reducers/series-season.reducer';
import Series from '../../store/models/series.model';
import { getSeriesByKey } from '../../store/selectors/series.selector';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import SeriesEpisode from '../../store/models/series-episode.model';
import { addSeriesEpisodeAction } from '../../store/reducers/series-episode.reducer';
import { SeriesSeason } from '../../store/models/series-season.model';
import { getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';

@injectable()
export class SeriesService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    public addSeries(seriesInfo: SeriesInfoDto): Series {
        const seriesKey = getKeyForSeriesTitle(seriesInfo.title);
        this.store.dispatch(addSeriesAction(seriesInfo));
        Object.keys(seriesInfo.seasonsLinks).forEach(seasonNumber => {

            const key = getKeyForSeriesSeason(seriesKey, +seasonNumber);

            const seriesSeason: SeriesSeason = {
                key,
                seriesKey,
                seasonNumber: +seasonNumber,
                // @ts-ignore
                portalLinks: {[seriesInfo.portal]: seriesInfo.seasonsLinks[seasonNumber]},
                episodes: []
            }

            this.store.dispatch(addSeriesSeasonAction(seriesSeason));
        });

        return this.store.selectSync(getSeriesByKey, seriesKey);
    }

    public addSeriesEpisodes(episodeDtos: SeriesEpisodeDto[]): SeriesEpisode[] {
        const episodeKeys: string[] = [];

        episodeDtos.forEach(episodeDto => {
            const seriesKey = getKeyForSeriesTitle(episodeDto.seriesTitle);
            const key = getKeyForSeriesEpisode(episodeDto.seriesTitle, episodeDto.seasonNumber, episodeDto.epdisodeNumber);
            episodeKeys.push(key);

            const episode: SeriesEpisode = {
                key,
                seriesKey,
                season: episodeDto.seasonNumber,
                episode: episodeDto.epdisodeNumber,
                // @ts-ignore
                portalLinks: {
                    [episodeDto.portal]: episodeDto.portalLinks
                },
                providorLinks: episodeDto.providorLinks
            };

            this.store.dispatch(addSeriesEpisodeAction(episode))
        });

        return episodeKeys.map(key => this.store.selectSync(getSeriesEpisodeByKey, key));
    }
}
