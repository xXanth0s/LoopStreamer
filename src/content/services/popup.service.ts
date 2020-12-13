import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { PopupConfig } from '../models/popup-config.model';
import { getSeriesByKey, isEndTimeConfiguredForSeries } from '../../store/selectors/series.selector';
import SeriesEpisode from '../../store/models/series-episode.model';
import { Popup } from '../enum/popup.enum';
import { getPopupEndTimeForSeriesEpisode } from '../../store/utils/series.utils';

@injectable()
export class PopupService {
    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    public getPopupConfigsForEpisode(episodeInfo: SeriesEpisode): PopupConfig[] {
        const configs = [
            this.getConfigForSetStartTimePopup(episodeInfo),
            this.getNextEpisodeCountdownConfig(episodeInfo),
            this.getConfigForSetEndTimePopup(episodeInfo),
        ];
        return configs.filter(config => config.mustBeOpened);
    }

    private getConfigForSetStartTimePopup(episodeInfo: SeriesEpisode): PopupConfig {
        const { isStartTimeConfigured } = this.store.selectSync(getSeriesByKey, episodeInfo.seriesKey);

        const hasTimeStamp = Boolean(episodeInfo.timestamp);

        const mustBeOpened = !(isStartTimeConfigured || hasTimeStamp);

        return {
            pupupKey: Popup.SET_STARTTIME,
            openFromStart: true,
            timeToOpen: 0,
            mustBeOpened,
        };
    }

    private getConfigForSetEndTimePopup(episodeInfo: SeriesEpisode): PopupConfig {
        const series = this.store.selectSync(getSeriesByKey, episodeInfo.seriesKey);
        const mustBeOpened = series && !series.isEndTimeConfigured;

        const timeToOpen = this.getEndTimeForConfiguredSeries(series.key);

        return {
            pupupKey: Popup.SET_ENDTIME,
            openFromStart: false,
            timeToOpen,
            mustBeOpened,
        };
    }

    private getNextEpisodeCountdownConfig(episodeInfo: SeriesEpisode): PopupConfig {
        const isEndTimeConfigured = this.store.selectSync(isEndTimeConfiguredForSeries, episodeInfo.seriesKey);

        const timeToOpen = this.getEndTimeForConfiguredSeries(episodeInfo.seriesKey);

        return {
            pupupKey: Popup.NEXT_EPISODE_COUNTDOWN,
            openFromStart: false,
            timeToOpen,
            mustBeOpened: isEndTimeConfigured,
        };
    }

    private getEndTimeForConfiguredSeries(seriesKey: string): number {
        const series = this.store.selectSync(getSeriesByKey, seriesKey);

        return getPopupEndTimeForSeriesEpisode(series);
    }
}
