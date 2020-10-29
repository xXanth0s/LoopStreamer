import { inject, injectable } from 'inversify';
import { CONTENT_TYPES } from '../container/CONTENT_TYPES';
import { NotificationService } from '../services/notification.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { MessageService } from '../../shared/services/message.service';
import { Popup } from '../enum/popup.enum';
import SeriesEpisode from '../../store/models/series-episode.model';
import { setEndTimeForSeriesAction, setStartTimeForSeriesAction } from '../../store/reducers/series.reducer';
import { getOptions } from '../../store/selectors/options.selector';
import { seriesEpisodeFinishedAction } from '../../store/reducers/series-episode.reducer';
import {
    createContinueAutoplayForEpisodeMessage,
    createVideoFinishedMessage
} from '../../browserMessages/messages/background.messages';
import { Logger } from '../../shared/services/logger';
import { isMaximumPlayedEpisodesLimitReached } from '../../store/selectors/control-state.selector';
import { PopupService } from '../services/popup.service';
import { PopupConfig } from '../models/popup-config.model';
import { getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';
import { createHasNextEpisodeMessage } from '../../browserMessages/messages/background-data.messages';
import { filter, first } from 'rxjs/operators';
import { Observable } from 'rxjs';

@injectable()
export class PopupController {

    private hasNextEpisode = true;
    private videoOnTimeUpdate$: Observable<number>;

    constructor(
        @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
        @inject(CONTENT_TYPES.NotificationService) private readonly notificationService: NotificationService,
        @inject(CONTENT_TYPES.PopupService) private readonly popupService: PopupService,
        @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService) {
    }

    public openPopupsForVideo(video: HTMLVideoElement, episodeKey: SeriesEpisode['key'], videoTimeUpdate$: Observable<number>): void {
        this.videoOnTimeUpdate$ = videoTimeUpdate$;
        const episodeInfo = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);
        const configs = this.popupService.getPopupConfigsForEpisode(episodeInfo);

        configs.forEach(config => this.openPupupAtTime(config, video, episodeInfo));

        this.checkIfNextEpisodeIsAvailable(episodeKey);

        Logger.log('[PopupController->openPopupsForVideo] Popup configs to be opened', configs);
    }

    public openVideoIsPreparingPopup(): void {
        this.notificationService.openVideoIsPreparingPopup();
    }

    private openPupupAtTime(config: PopupConfig, video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        const videoDuration = video.duration;
        this.videoOnTimeUpdate$.pipe(
            filter(timeStamp => this.isTimeToOpenPopup(config, timeStamp, videoDuration)),
            first()
        ).subscribe(() => this.openPopup(config, video, episodeInfo));
    }

    private openPopup(config: PopupConfig, video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        Logger.log('[PopupController->openPopup]', config, episodeInfo);

        switch (config.pupupKey) {
            case Popup.AUTO_PLAY_FINISHED:
                this.openEpisodeLimitReachedPopup(episodeInfo.key);
                break;
            case Popup.NEXT_EPISODE_COUNTDOWN:
                this.openNextEpisodeCountdownPopup(video, episodeInfo);
                break;
            case Popup.SET_ENDTIME:
                this.openSetEndTimePopup(video, episodeInfo);
                break;
            case Popup.SET_STARTTIME:
                this.openSetStartTimePopup(video, episodeInfo);
                break;
        }
    }

    private openSetStartTimePopup(video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        this.notificationService.openSetStartTimePopup(
            () => {
                this.store.dispatch(setStartTimeForSeriesAction({
                    key: episodeInfo.seriesKey,
                    scipStartTime: video.currentTime
                }));
            },
            () => {
                this.store.dispatch(setStartTimeForSeriesAction({
                    key: episodeInfo.seriesKey,
                    scipStartTime: undefined
                }));
            });
    }

    private openSetEndTimePopup(video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        this.store.dispatch(seriesEpisodeFinishedAction(episodeInfo.key));
        const popupCountdown = this.getTimeForSetEndtimeCountdon(video);

        this.notificationService.openSetEndTimePopup(
            popupCountdown,
            async () => {
                const timeFromEnd = video.duration - video.currentTime;
                await this.store.dispatch(setEndTimeForSeriesAction({
                    key: episodeInfo.seriesKey,
                    scipEndTime: timeFromEnd
                }));
                this.videoEnded(episodeInfo.key);
            },
            async () => {
                await this.store.dispatch(setEndTimeForSeriesAction({
                    key: episodeInfo.seriesKey,
                    scipEndTime: undefined
                }));
            }, () => this.openNextEpisodeCountdownPopupOnEndOfVideo(video, episodeInfo));
    }

    private openNextEpisodeCountdownPopup(video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        if (!this.hasNextEpisode) {
            return;
        }

        const isEpisodeLimitReached = this.store.selectSync(isMaximumPlayedEpisodesLimitReached);
        if (isEpisodeLimitReached) {
            this.openEpisodeLimitReachedPopup(episodeInfo.key);
            return;
        }

        this.store.dispatch(seriesEpisodeFinishedAction(episodeInfo.key));

        const popupCountdown = this.getTimeTillForNextEpisodeCountdown(video);

        this.notificationService.openEndTimePopup(
            popupCountdown,
            () => {
                this.videoEnded(episodeInfo.key);
            });
    }

    private openEpisodeLimitReachedPopup(episodeKey: SeriesEpisode['key']): void {
        if (!this.hasNextEpisode) {
            return;
        }

        this.notificationService.openEpisodeLimitReachedPopup(
            () => {
                this.messageService.sendMessageToBackground(createContinueAutoplayForEpisodeMessage(episodeKey));
                this.openVideoIsPreparingPopup();
            });
    }

    private videoEnded(episodeKey: SeriesEpisode['key']): void {
        if (!this.hasNextEpisode) {
            return;
        }

        const isPlayedEpisodeLimitReached = this.store.selectSync(isMaximumPlayedEpisodesLimitReached);
        if (isPlayedEpisodeLimitReached) {
            this.openEpisodeLimitReachedPopup(episodeKey);
        } else {
            this.messageService.sendMessageToBackground(createVideoFinishedMessage(episodeKey));
            this.openVideoIsPreparingPopup();
        }
    }

    private openNextEpisodeCountdownPopupOnEndOfVideo(video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        const timeToOpen = this.getTimeTillForNextEpisodeCountdown(video);

        const config: PopupConfig = {
            pupupKey: Popup.NEXT_EPISODE_COUNTDOWN,
            openFromStart: false,
            mustBeOpened: true,
            timeToOpen,
        };

        this.openPupupAtTime(config, video, episodeInfo);
    }

    private isTimeToOpenPopup(popupConfig: PopupConfig, currentTime: number, videoDuration: number): boolean {
        if (popupConfig.openFromStart) {
            return currentTime >= popupConfig.timeToOpen;
        }

        const timeFromEnd = videoDuration - currentTime;
        return popupConfig.timeToOpen >= timeFromEnd;
    }

    private async checkIfNextEpisodeIsAvailable(seriesEpisodeKey: SeriesEpisode['key']): Promise<void> {
        this.hasNextEpisode = await this.messageService.sendMessageToBackground(createHasNextEpisodeMessage(seriesEpisodeKey));
    }

    private getTimeTillForNextEpisodeCountdown(video: HTMLVideoElement): number {
        const { timeForEndtimeCountdown } = this.store.selectSync(getOptions);

        const timeLeftInVideo = video.duration - video.currentTime;

        return timeLeftInVideo < timeForEndtimeCountdown ? timeLeftInVideo : timeForEndtimeCountdown;
    }

    private getTimeForSetEndtimeCountdon(video: HTMLVideoElement): number {
        const { timeTillSetEndtimePopup } = this.store.selectSync(getOptions);

        const timeLeftInVideo = video.duration - video.currentTime;

        return timeLeftInVideo < timeTillSetEndtimePopup ? timeLeftInVideo : timeTillSetEndtimePopup;
    }
}
