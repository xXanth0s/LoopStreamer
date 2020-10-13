import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { PopupConfig } from '../models/popup-config.model';
import { getSeriesByKey } from '../../store/selectors/series.selector';
import SeriesEpisode from '../../store/models/series-episode.model';
import { Popup } from '../enum/popup.enum';
import { getOptions } from '../../store/selectors/options.selector';
import { isMaximumPlayedEpisodesLimitReached } from '../../store/selectors/control-state.selector';
import { hasSeriesEpisodeNextEpisode } from '../../store/selectors/series-episode.selector';

@injectable()
export class PopupService {

    private readonly endTimeBuffer = 5;

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    public getPopupConfigsForEpisode(episodeInfo: SeriesEpisode): PopupConfig[] {
        const configs = [
            this.getConfigForSetStartTimePopup(episodeInfo),
            this.getAutoPlayFinishedConfig(episodeInfo),
            this.getNextEpisodeCountdownConfig(episodeInfo),
            this.getConfigForSetEndTimeConfig(episodeInfo),
        ]
        return configs.filter(config => config.mustBeOpened);
    }

    private getConfigForSetStartTimePopup(episodeInfo: SeriesEpisode): PopupConfig {
        const { isStartTimeConfigured } = this.store.selectSync(getSeriesByKey, episodeInfo.seriesKey);

        const hasTimeStamp = Boolean(episodeInfo.timestamp)

        const mustBeOpened = !(isStartTimeConfigured || hasTimeStamp);

        return {
            pupupKey: Popup.SET_STARTTIME,
            openFromStart: true,
            timeToOpen: 0,
            mustBeOpened
        }
    }

    private getConfigForSetEndTimeConfig(episodeInfo: SeriesEpisode): PopupConfig {
        const { isEndTimeConfigured } = this.store.selectSync(getSeriesByKey, episodeInfo.seriesKey);
        const { timeTillSetEndtimePopup } = this.store.selectSync(getOptions)
        const mustBeOpened = !isEndTimeConfigured

        return {
            pupupKey: Popup.SET_ENDTIME,
            openFromStart: false,
            timeToOpen: timeTillSetEndtimePopup,
            mustBeOpened
        }
    }

    private getNextEpisodeCountdownConfig(episodeInfo: SeriesEpisode): PopupConfig {
        const isLastAutoPlayEpisode = this.store.selectSync(isMaximumPlayedEpisodesLimitReached);
        const hasNextEpisode = this.store.selectSync(hasSeriesEpisodeNextEpisode, episodeInfo.key);
        const { isEndTimeConfigured } = this.store.selectSync(getSeriesByKey, episodeInfo.seriesKey);

        const mustBeOpened = !isLastAutoPlayEpisode && isEndTimeConfigured && hasNextEpisode;
        const timeToOpen = this.getEndTimeForConfiguredSeries(episodeInfo.seriesKey);

        return {
            pupupKey: Popup.NEXT_EPISODE_COUNTDOWN,
            openFromStart: false,
            timeToOpen,
            mustBeOpened
        }
    }

    private getAutoPlayFinishedConfig(episodeInfo: SeriesEpisode): PopupConfig {
        const isLastAutoPlayEpisode = this.store.selectSync(isMaximumPlayedEpisodesLimitReached);
        const hasNextEpisode = this.store.selectSync(hasSeriesEpisodeNextEpisode, episodeInfo.key)
        const timeToOpen = this.getEndTimeForConfiguredSeries(episodeInfo.seriesKey);

        const mustBeOpened = isLastAutoPlayEpisode && hasNextEpisode;

        return {
            pupupKey: Popup.AUTO_PLAY_FINISHED,
            openFromStart: false,
            timeToOpen,
            mustBeOpened
        }
    }

    private getEndTimeForConfiguredSeries(seriesKey: string): number {
        const { timeForEntimeCountdown } = this.store.selectSync(getOptions)
        const { isEndTimeConfigured, scipEndTime } = this.store.selectSync(getSeriesByKey, seriesKey);

        if (!isEndTimeConfigured || scipEndTime < timeForEntimeCountdown - this.endTimeBuffer) {
            return timeForEntimeCountdown;
        }

        return scipEndTime + timeForEntimeCountdown - this.endTimeBuffer;
    }

}
