import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../constants/SHARED_TYPES';
import { StoreService } from './store.service';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { updateOrAddMultipleSeriesAction, updateOrAddSeriesAction } from '../../store/reducers/series.reducer';
import { updateOrAddMutlipleSeriesSeasonAction } from '../../store/reducers/series-season.reducer';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { updateOrAddMultipleSeriesEpisodeAction } from '../../store/reducers/series-episode.reducer';
import {
    mapSeriesEpisodeDtoToSeriesEpisode,
    mapSeriesInfoDtoToSeries,
    mapSeriesInfoDtoToSeriesSeasons
} from '../../store/utils/series.utils';
import Series from '../../store/models/series.model';
import SeriesEpisode from '../../store/models/series-episode.model';
import { getLastWatchedEpisode } from '../../store/selectors/series.selector';
import {
    getFirstEpisodeForSeason,
    getNextEpisode,
    getSeriesEpisodeByKey
} from '../../store/selectors/series-episode.selector';
import { PORTALS } from '../../store/enums/portals.enum';
import { getNextSeason, getSeriesSeasonByKey } from '../../store/selectors/series-season.selector';
import { PortalController } from '../../background/controller/portal.controller';
import { BACKGROUND_TYPES } from '../../background/container/BACKGROUND_TYPES';
import { SeriesSeason } from '../../store/models/series-season.model';

@injectable()
export class SeriesService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(BACKGROUND_TYPES.PortalController) private readonly portalController: PortalController) {
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

            this.store.dispatch(updateOrAddMutlipleSeriesSeasonAction(seriesSeasons));
        }
    }

    public addSeriesEpisodesToStore(episodeDtos: SeriesEpisodeDto[]): void {
        const episodes = episodeDtos.map(mapSeriesEpisodeDtoToSeriesEpisode);

        this.store.dispatch(updateOrAddMultipleSeriesEpisodeAction(episodes));
    }

    public async getContinuableEpisodeForSeries(seriesKey: Series['key'], portalKey: PORTALS): Promise<SeriesEpisode> {
        const lastWatchedEpisode = this.store.selectSync(getLastWatchedEpisode, seriesKey);
        if (!lastWatchedEpisode) {
            return null;
        }

        if (!lastWatchedEpisode.isFinished) {
            return lastWatchedEpisode;
        }

        return this.getNextEpisode(lastWatchedEpisode.key, portalKey);
    }

    public async getNextEpisode(episodeKey: SeriesEpisode['key'], portalKey: PORTALS): Promise<SeriesEpisode> {
        const lastEpisode = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);
        if (!lastEpisode) {
            return null;
        }

        const nextEpisode = await this.getNextEpisodeForSameSeason(lastEpisode, portalKey);
        if (nextEpisode) {
            return nextEpisode;
        }

        return this.getFirstEpisodeForNextSeason(lastEpisode.seasonKey, portalKey);
    }

    private async getNextEpisodeForSameSeason({ key, seasonKey }: SeriesEpisode, portalKey: PORTALS): Promise<SeriesEpisode> {
        const nextEpisode = this.store.selectSync(getNextEpisode, key);
        if (nextEpisode) {
            return nextEpisode;
        }

        await this.updateSeasonForPortal(seasonKey, portalKey);
        return this.store.selectSync(getNextEpisode, key);
    }

    private async getFirstEpisodeForNextSeason(seasonKey: SeriesSeason['key'], portalKey: PORTALS): Promise<SeriesEpisode> {
        let nextSeason = await this.getNextSeason(seasonKey, portalKey);
        if (!nextSeason) {
            return null;
        }

        const firstEpisode = this.store.selectSync(getFirstEpisodeForSeason, nextSeason.key);
        if (firstEpisode) {
            return firstEpisode;
        }

        await this.updateSeasonForPortal(nextSeason.key, portalKey);
        return this.store.selectSync(getFirstEpisodeForSeason, nextSeason.key);
    }

    private async getNextSeason(seasonKey: SeriesSeason['key'], portal: PORTALS): Promise<SeriesSeason> {
        let nextSeason = this.store.selectSync(getNextSeason, seasonKey);
        if (!nextSeason) {
            const currentSeason = this.store.selectSync(getSeriesSeasonByKey, seasonKey);
            const isSeriesUpdateSuccessful = this.updateSeriesForPortal(currentSeason?.seriesKey, portal);
            if (!isSeriesUpdateSuccessful) {
                return null;
            }

            nextSeason = this.store.selectSync(getNextSeason, seasonKey);
        }

        return nextSeason;
    }

    private async updateSeasonForPortal(seasonKey: SeriesSeason['key'], portal: PORTALS): Promise<boolean> {
        const seasonEpisodes = await this.portalController.getEpisodesForSeason(seasonKey, portal);
        if (seasonEpisodes && seasonEpisodes.length > 0) {
            this.addSeriesEpisodesToStore(seasonEpisodes);
            return true;
        }

        return false;
    }

    private async updateSeriesForPortal(seriesKey: Series['key'], portal: PORTALS): Promise<boolean> {
        const seriesInfo = await this.portalController.getDetailedSeriesInformation(seriesKey, portal);
        if (seriesInfo) {
            this.addSeriesToStore(seriesInfo);
        }

        return Boolean(seriesInfo);
    }
}
