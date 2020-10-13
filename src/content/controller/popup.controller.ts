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
import { createVideoFinishedMessage } from '../../browserMessages/messages/background.messages';

@injectable()
export class PopupController {


    constructor(
        @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
        @inject(CONTENT_TYPES.NotificationService) private readonly notificationService: NotificationService,
        @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService) {
    }

    public openPopup(popupKey: Popup, video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        switch (popupKey) {
            case Popup.AUTO_PLAY_FINISHED:
                this.openEpisodeLimitReachedPopup();
                break;
            case Popup.NEXT_EPISODE_COUNTDOWN:
                this.openNextEpisodeCountdownPopup(episodeInfo);
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
        const { timeTillSetEndtimePopup } = this.store.selectSync(getOptions);
        this.notificationService.openSetEndTimePopup(
            timeTillSetEndtimePopup,
            async () => {
                const timeFromEnd = video.duration - video.currentTime;
                await this.store.dispatch(setEndTimeForSeriesAction({
                    key: episodeInfo.seriesKey,
                    scipEndTime: timeFromEnd
                }));
                this.videoEnded();
            },
            async () => {
                await this.store.dispatch(setEndTimeForSeriesAction({
                    key: episodeInfo.seriesKey,
                    scipEndTime: undefined
                }));
            }, () => {
                this.videoEnded();
            });
    }

    private openNextEpisodeCountdownPopup(episodeInfo: SeriesEpisode): void {
        this.store.dispatch(seriesEpisodeFinishedAction(episodeInfo.key));
        const { timeForEntimeCountdown } = this.store.selectSync(getOptions);

        this.notificationService.openEndTimePopup(
            timeForEntimeCountdown,
            () => {
                this.videoEnded();
            },
            () => {
            });

    }

    private openEpisodeLimitReachedPopup(): void {
        this.notificationService.openEpisodeLimitReachedPopup(
            () => {
                // this.messageService.sendMessageToBackground(createContinueActiveSeries())
            }, () => {
            });

    }


    private videoEnded(): void {
        console.log('video Ended');
        this.messageService.sendMessageToBackground(createVideoFinishedMessage());
    }
}
