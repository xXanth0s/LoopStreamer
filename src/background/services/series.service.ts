import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
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
import { getLastUsedEpisodeForSeries, getLastWatchedEpisode } from '../../store/selectors/series.selector';
import {
    getFirstEpisodeForSeason,
    getNextEpisode,
    getSeriesEpisodeByKey
} from '../../store/selectors/series-episode.selector';
import { PORTALS } from '../../store/enums/portals.enum';
import { getNextSeason, getSeriesSeasonByKey } from '../../store/selectors/series-season.selector';
import { PortalController } from '../controller/portal.controller';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { SeriesSeason } from '../../store/models/series-season.model';

@injectable()
export class SeriesService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(BACKGROUND_TYPES.PortalController) private readonly portalController: PortalController) {
    }

    public async updateAllSeriesForPortal(portalKey: PORTALS): Promise<boolean> {
        const multipleSeriesMetaInfo = await this.portalController.getAllSeriesFromPortal(portalKey);
        if (multipleSeriesMetaInfo) {
            this.addMultipleSeriesToStore(multipleSeriesMetaInfo);
            return true;
        }

        return false;
    }

    public async updateSeriesForPortal(seriesKey: Series['key'], portal: PORTALS): Promise<boolean> {
        const seriesInfo = await this.portalController.getDetailedSeriesInformation(seriesKey, portal);
        if (seriesInfo) {
            this.addSeriesToStore(seriesInfo);
        }

        return Boolean(seriesInfo);
    }

    public async updateSeasonForPortal(seasonKey: SeriesSeason['key'], portal: PORTALS): Promise<boolean> {
        const seasonEpisodes = await this.portalController.getEpisodesForSeason(seasonKey, portal);
        if (seasonEpisodes && seasonEpisodes.length > 0) {
            this.addSeriesEpisodesToStore(seasonEpisodes);
            return true;
        }

        return false;
    }

    public async getContinuableEpisodeForSeries(seriesKey: Series['key'], portalKey?: PORTALS): Promise<SeriesEpisode> {
        const lastWatchedEpisode = this.store.selectSync(getLastWatchedEpisode, seriesKey);
        const finalPortal = portalKey || this.store.selectSync(getLastUsedEpisodeForSeries, seriesKey);
        if (!lastWatchedEpisode || !finalPortal) {
            return null;
        }

        if (!lastWatchedEpisode.isFinished) {
            return lastWatchedEpisode;
        }

        return this.getNextEpisode(lastWatchedEpisode.key, finalPortal);
    }

    public async getNextEpisode(episodeKey: SeriesEpisode['key'], portalKey?: PORTALS): Promise<SeriesEpisode> {
        const lastEpisode = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);
        if (!lastEpisode) {
            return null;
        }
        const finalPortal = portalKey || this.store.selectSync(getLastUsedEpisodeForSeries, lastEpisode.seriesKey);
        if (!finalPortal) {
            return null;
        }

        const nextEpisode = await this.getNextEpisodeForSameSeason(lastEpisode, portalKey);
        if (nextEpisode) {
            return nextEpisode;
        }

        return this.getFirstEpisodeForNextSeason(lastEpisode.seasonKey, finalPortal);
    }

    private async getNextEpisodeForSameSeason({ key, seasonKey, seriesKey }: SeriesEpisode, portalKey?: PORTALS): Promise<SeriesEpisode> {
        const nextEpisode = this.store.selectSync(getNextEpisode, key);
        if (nextEpisode) {
            return nextEpisode;
        }

        const finalPortal = portalKey || this.store.selectSync(getLastUsedEpisodeForSeries, seriesKey);
        if (!finalPortal) {
            return null;
        }

        await this.updateSeasonForPortal(seasonKey, finalPortal);
        return this.store.selectSync(getNextEpisode, key);
    }

    private async getFirstEpisodeForNextSeason(seasonKey: SeriesSeason['key'], portalKey?: PORTALS): Promise<SeriesEpisode> {
        let nextSeason = await this.getNextSeason(seasonKey, portalKey);
        if (!nextSeason) {
            return null;
        }

        const firstEpisode = this.store.selectSync(getFirstEpisodeForSeason, nextSeason.key);
        if (firstEpisode) {
            return firstEpisode;
        }

        const season = this.store.selectSync(getSeriesSeasonByKey, seasonKey);
        const finalPortal = portalKey || this.store.selectSync(getLastUsedEpisodeForSeries, season.seriesKey);
        if (!finalPortal) {
            return null;
        }

        await this.updateSeasonForPortal(nextSeason.key, finalPortal);
        return this.store.selectSync(getFirstEpisodeForSeason, nextSeason.key);
    }

    private async getNextSeason(seasonKey: SeriesSeason['key'], portalKey?: PORTALS): Promise<SeriesSeason> {
        let nextSeason = this.store.selectSync(getNextSeason, seasonKey);
        if (!nextSeason) {
            const currentSeason = this.store.selectSync(getSeriesSeasonByKey, seasonKey);

            const finalPortal = portalKey || this.store.selectSync(getLastUsedEpisodeForSeries, currentSeason.seriesKey);
            if (!finalPortal) {
                return null;
            }

            const isSeriesUpdateSuccessful = this.updateSeriesForPortal(currentSeason?.seriesKey, finalPortal);
            if (!isSeriesUpdateSuccessful) {
                return null;
            }

            nextSeason = this.store.selectSync(getNextSeason, seasonKey);
        }

        return nextSeason;
    }

    private addMultipleSeriesToStore(seriesInfo: SeriesInfoDto[]): void {
        const series = seriesInfo.map(mapSeriesInfoDtoToSeries);

        this.store.dispatch(updateOrAddMultipleSeriesAction(series));
    }

    private addSeriesToStore(seriesInfo: SeriesInfoDto): void {
        const series = mapSeriesInfoDtoToSeries(seriesInfo);
        this.store.dispatch(updateOrAddSeriesAction(series));

        if (seriesInfo.seasonsLinks) {
            const seriesSeasons = mapSeriesInfoDtoToSeriesSeasons(seriesInfo);

            this.store.dispatch(updateOrAddMutlipleSeriesSeasonAction(seriesSeasons));
        }
    }

    private addSeriesEpisodesToStore(episodeDtos: SeriesEpisodeDto[]): void {
        const episodes = episodeDtos.map(mapSeriesEpisodeDtoToSeriesEpisode);

        this.store.dispatch(updateOrAddMultipleSeriesEpisodeAction(episodes));
    }
}
