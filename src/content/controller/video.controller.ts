import {inject, injectable} from 'inversify';
import SeriesEpisode from '../../store/models/series-episode.model';
import {combineLatest, Subject, timer} from 'rxjs';
import {filter, takeUntil, throttleTime} from 'rxjs/operators';
import {
    setEndTimeForSeriesAction,
    setStartTimeForSeriesAction,
    updateSeriesAction,
    updateSeriesEpisodeAction
} from '../../store/reducers/series.reducer';
import {getSeriesByKey} from '../../store/selectors/series.selector';
import {FULL_SCREEN_VIDEO} from '../constants/class-names';
import {SHARED_TYPES} from '../../shared/constants/SHARED_TYPES';
import {StoreService} from '../../shared/services/store.service';
import {CONTENT_TYPES} from '../container/CONTENT_TYPES';
import {NotificationService} from '../services/notification.service';
import {getOptions} from '../../store/selectors/options.selector';
import Series from '../../store/models/series.model';
import {MessageService} from '../../shared/services/message.service';
import {createVideoFinishedMessage} from '../../browserMessages/messages/background.messages';
import {addVideoButtons} from '../html/video-button/video-buttons.component';
import {ControllerType} from '../../browserMessages/enum/controller.type';

@injectable()
export class VideoController {

    constructor(
        @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
        @inject(CONTENT_TYPES.NotificationService) private readonly notificationService: NotificationService,
        @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
    ) {
        this.messageService.setControllerType(ControllerType.PROVIDOR)
    }

    private readonly timeout = 10000;

    private videoStarted$ = new Subject();
    private onTimeUpdate$ = new Subject();
    private stopAutoPlay$ = new Subject();

    // TODO: remove ugly hack for multiple initializations
    private isActive = false;

    public startVideo(videoElement: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        if (!this.isActive) {
            this.isActive = true;
            const seriesInfo = this.store.selectSync(getSeriesByKey, episodeInfo.seriesKey)
            videoElement.play().then(() => this.onVideoStarted(videoElement, episodeInfo, seriesInfo));
            // this.store.dispatch(updateSeriesAction(seriesInfo));
            this.startErrorTimer(this.timeout);
        }
    }

    private onVideoStarted(video: HTMLVideoElement, episodeInfo: SeriesEpisode, seriesInfo: Series): void {
        this.initOnTimeUpdateObservable(video);
        this.videoStarted$.next();
        // this.setStartTime(video, episodeInfo);
        // this.updateSeriesInfo(video, episodeInfo);
        // this.endTimeListener(video, episodeInfo);
        this.videoFinishedListener(video);
        addVideoButtons(episodeInfo);
    }

    private initOnTimeUpdateObservable(video: HTMLVideoElement): void {
        video.ontimeupdate = () => this.onTimeUpdate$.next();
    }

    private startErrorTimer(timeout: number): void {
        timer(timeout).pipe(
            takeUntil(this.videoStarted$)
        ).subscribe(() => {
            console.error('VivoController: Problem with starting the video');
        })
    }

    private updateSeriesInfo(video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        this.onTimeUpdate$.pipe(
            throttleTime(1000),
        ).subscribe(async () => {
            episodeInfo.timestamp = video.currentTime;
            await this.store.dispatch(updateSeriesEpisodeAction(episodeInfo));
        })
    }

    private endTimeListener(video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        const seriesInfo$ = this.store.selectBehaviour(getSeriesByKey, episodeInfo.seriesKey).pipe(
            filter<Series>(Boolean)
        );
        const options$ = this.store.selectBehaviour(getOptions);
        const takeUntil$ = new Subject();

        combineLatest([this.onTimeUpdate$, seriesInfo$, options$]).pipe(
            throttleTime(1000),
            takeUntil(takeUntil$)
        ).subscribe(([timeUpdate, seriesInfo, options]) => {
            const timeLeft = video.duration - video.currentTime;
            if (seriesInfo.endTimeConfigured) {
                if (timeLeft < seriesInfo.scipEndTime) {
                    this.openEndTimePopup(episodeInfo);
                    takeUntil$.next();
                }
            } else {
                if (timeLeft < options.timeTillRequestPopup) {
                    this.openSetEndTimePopup(video, episodeInfo);
                    takeUntil$.next();
                }
            }
        })
    }

    private videoFinishedListener(video: HTMLVideoElement): void {
        const hasFinished$ = new Subject();

        video.onended = () => hasFinished$.next();

        hasFinished$.pipe(
            takeUntil(this.stopAutoPlay$)
        ).subscribe(() => this.videoEnded());
    }

    private setStartTime(video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        const series = this.store.selectSync(getSeriesByKey, episodeInfo.seriesKey);
        // if (series?.lastEpisodeWatched?.episode === episodeInfo.episode
        //     && series?.lastEpisodeWatched?.season === episodeInfo.season
        //     && series?.lastEpisodeWatched.timestamp) {
        //     video.currentTime = series.lastEpisodeWatched.timestamp;
        // } else if (series?.startTimeConfigured) {
        //     if (series.scipStartTime) {
        //         video.currentTime = series.scipStartTime;
        //     }
        // } else {
        //     this.openSetStartTimePopup(video, episodeInfo);
        // }
    }

    public addFullscreenClass(nodeElement: HTMLElement): void {
        nodeElement.classList.add(FULL_SCREEN_VIDEO);
    }

    private openSetStartTimePopup(video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        if(!Boolean(episodeInfo.timestamp)) {
            this.notificationService.openSetStartTimePopup(
                () => {
                    this.store.dispatch(setStartTimeForSeriesAction({
                        key: episodeInfo.seriesKey,
                        scipStartTime: video.currentTime
                    }))
                },
                () => {
                    this.store.dispatch(setStartTimeForSeriesAction({key: episodeInfo.seriesKey, scipStartTime: undefined}))
                })
        }
    }

    private openSetEndTimePopup(video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        this.notificationService.openSetEndTimePopup(
            async () => {
                await this.store.dispatch(setEndTimeForSeriesAction({
                    key: episodeInfo.seriesKey,
                    scipEndTime: video.currentTime
                }));
                this.videoEnded();
            },
            async () => {
                await this.store.dispatch(setEndTimeForSeriesAction({
                    key: episodeInfo.seriesKey,
                    scipEndTime: undefined
                }))
            })
    }

    private openEndTimePopup(episodeInfo: SeriesEpisode): void {
        if (episodeInfo.hasNextEpisode) {
            this.notificationService.openEndTimePopup(
                () => {
                    this.videoEnded();
                },
                () => {
                    this.stopAutoPlay$.next();
                })
        }
    }

    private videoEnded(): void {
        this.messageService.sendMessageToBackground(createVideoFinishedMessage());
    }
}
