import { inject, injectable } from 'inversify';
import { filter, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { CONTENT_TYPES } from '../container/CONTENT_TYPES';
import { NotificationService } from '../services/notification.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { MessageService } from '../../shared/services/message.service';
import { Popup } from '../enum/popup.enum';
import SeriesEpisode from '../../store/models/series-episode.model';
import { setEndTimeForSeriesAction, setStartTimeForSeriesAction } from '../../store/reducers/series.reducer';
import { getOptions } from '../../store/selectors/options.selector';
import { Logger } from '../../shared/services/logger';
import { isMaximumPlayedEpisodesLimitReached } from '../../store/selectors/control-state.selector';
import { PopupService } from '../services/popup.service';
import { PopupConfig } from '../models/popup-config.model';
import { getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';
import { continueAutoplayAction, startNextEpisodeAction } from '../../store/actions/shared.actions';

@injectable()
export class PopupController {
    private videoOnTimeUpdate$: Observable<number>;
    private popupFinallyClosed$ = new Subject<Popup>();

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

        Logger.log('[PopupController->openPopupsForVideo] Popup configs to be opened', configs);
    }

    public openVideoIsPreparingPopup(): void {
        this.notificationService.openVideoIsPreparingPopup();
    }

    private openPupupAtTime(config: PopupConfig, video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        const videoDuration = video.duration;
        let isOpen = false;

        const takeUntil$ = this.popupFinallyClosed$.pipe(
            filter(key => key === config.pupupKey),
        );

        this.videoOnTimeUpdate$.pipe(
            takeUntil(takeUntil$),
        ).subscribe(timestamp => {
            const shouldOpen = this.isTimeToOpenPopup(config, timestamp, videoDuration);
            if (!shouldOpen && isOpen) {
                this.notificationService.closeAllPopups();
                isOpen = false;
            } else if (shouldOpen && !isOpen) {
                setTimeout(() => this.openPopup(config, video, episodeInfo));
                isOpen = true;
            }
        });
    }

    private openPopup(config: PopupConfig, video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        Logger.log('[PopupController->openPopup]', config, episodeInfo);

        switch (config.pupupKey) {
            case Popup.AUTO_PLAY_FINISHED:
                this.openEpisodeLimitReachedPopup(episodeInfo.key);
                break;
            case Popup.NEXT_EPISODE_COUNTDOWN:
                this.openNextEpisodeCountdownPopup(video, episodeInfo.key);
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
                    scipStartTime: video.currentTime,
                }));
                this.popupFinallyClosed$.next(Popup.SET_STARTTIME);
            },
            () => {
                this.store.dispatch(setStartTimeForSeriesAction({
                    key: episodeInfo.seriesKey,
                    scipStartTime: undefined,
                }));
                this.popupFinallyClosed$.next(Popup.SET_STARTTIME);
            }, () => {
                this.popupFinallyClosed$.next(Popup.SET_STARTTIME);
            });
    }

    private openSetEndTimePopup(video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        const popupCountdown = this.getTimeForSetEndtimeCountdon(video);

        this.notificationService.openSetEndTimePopup(
            popupCountdown,
            async () => {
                const timeFromEnd = video.duration - video.currentTime;
                await this.store.dispatch(setEndTimeForSeriesAction({
                    key: episodeInfo.seriesKey,
                    scipEndTime: timeFromEnd,
                }));
                this.videoEnded(episodeInfo.key);
                this.popupFinallyClosed$.next(Popup.SET_ENDTIME);
            },
            async () => {
                await this.store.dispatch(setEndTimeForSeriesAction({
                    key: episodeInfo.seriesKey,
                    scipEndTime: undefined,
                }));
                this.popupFinallyClosed$.next(Popup.SET_ENDTIME);
            }, () => {
                this.openNextEpisodeCountdownPopupOnEndOfVideo(video, episodeInfo);
                this.popupFinallyClosed$.next(Popup.SET_ENDTIME);
            });
    }

    private openNextEpisodeCountdownPopup(video: HTMLVideoElement, seriesEpisodeKey: SeriesEpisode['key']): void {
        const episodeInfo = this.store.selectSync(getSeriesEpisodeByKey, seriesEpisodeKey);
        if (!episodeInfo.hasNextEpisode) {
            return;
        }

        const isEpisodeLimitReached = this.store.selectSync(isMaximumPlayedEpisodesLimitReached);
        if (isEpisodeLimitReached) {
            this.openEpisodeLimitReachedPopup(seriesEpisodeKey);
            return;
        }

        const popupCountdown = this.getTimeTillForNextEpisodeCountdown(video);

        this.notificationService.openEndTimePopup(
            popupCountdown,
            () => {
                this.videoEnded(seriesEpisodeKey);
            });
    }

    private openEpisodeLimitReachedPopup(episodeKey: SeriesEpisode['key']): void {
        const episodeInfo = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);
        if (!episodeInfo.hasNextEpisode) {
            return;
        }

        this.notificationService.openEpisodeLimitReachedPopup(
            () => {
                this.store.dispatch(continueAutoplayAction(episodeKey));
                this.openVideoIsPreparingPopup();
            });
    }

    private videoEnded(episodeKey: SeriesEpisode['key']): void {
        const episodeInfo = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);
        if (!episodeInfo.hasNextEpisode) {
            return;
        }

        const isPlayedEpisodeLimitReached = this.store.selectSync(isMaximumPlayedEpisodesLimitReached);
        if (isPlayedEpisodeLimitReached) {
            this.openEpisodeLimitReachedPopup(episodeKey);
        } else {
            this.store.dispatch(startNextEpisodeAction({ episodeKey, userAction: false }));
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
