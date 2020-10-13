import { inject, injectable } from 'inversify';
import { Observable, Subject, timer } from 'rxjs';
import { first, takeUntil, throttleTime } from 'rxjs/operators';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { CONTENT_TYPES } from '../container/CONTENT_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { addVideoButtons } from '../html/video-button/video-buttons.component';
import { PopupService } from '../services/popup.service';
import { PopupController } from './popup.controller';
import { ControllerType } from '../../browserMessages/enum/controller.type';
import SeriesEpisode from '../../store/models/series-episode.model';
import { getSeriesByKey } from '../../store/selectors/series.selector';
import {
    seriesEpisodeStartedAction,
    setTimestampForSeriesEpisodeAction
} from '../../store/reducers/series-episode.reducer';
import { getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';
import { PopupConfig } from '../models/popup-config.model';

@injectable()
export class VideoController {

    constructor(
        @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
        @inject(CONTENT_TYPES.PopupService) private readonly popupService: PopupService,
        @inject(CONTENT_TYPES.PopupController) private readonly popupController: PopupController,
        @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
    ) {
        this.messageService.setControllerType(ControllerType.PROVIDOR)
    }

    private readonly timeout = 10000;

    private videoStarted$ = new Subject();

    // TODO: remove ugly hack for multiple initializations
    private isActive = false;

    public startVideo(videoElement: HTMLVideoElement, seriesEpisodeKey: SeriesEpisode['key']): void {
        if (!this.isActive) {
            this.isActive = true;
            videoElement.play().then(() => this.onVideoStarted(videoElement, seriesEpisodeKey));
            this.startErrorTimer(this.timeout);
        }
    }

    private async onVideoStarted(video: HTMLVideoElement, seriesEpisodeKey: SeriesEpisode['key']): Promise<void> {
        this.videoStarted$.next();
        await this.store.dispatch(seriesEpisodeStartedAction({seriesEpisodeKey: seriesEpisodeKey, duration: video.duration}));

        this.store.select(getSeriesEpisodeByKey, seriesEpisodeKey).pipe(
            first()
        ).subscribe(episodeData => {
            const videoTimeUpdate$ = this.getVideoTimeChanges(video);

            this.setStartTime(video, episodeData);
            this.setActiveTimestamp(episodeData, videoTimeUpdate$);
            this.popupTimeListener(video, episodeData, videoTimeUpdate$);
            addVideoButtons(episodeData);
        })
    }

    private getVideoTimeChanges(video: HTMLVideoElement): Observable<number> {
        const onTimeSub$ = new Subject<number>();
        video.ontimeupdate = () => onTimeSub$.next(video.currentTime);

        return onTimeSub$
    }

    private startErrorTimer(timeout: number): void {
        timer(timeout).pipe(
            takeUntil(this.videoStarted$)
        ).subscribe(() => {
            console.error('VivoController: Problem with starting the video');
        })
    }

    private popupTimeListener(video: HTMLVideoElement, episodeInfo: SeriesEpisode, videoTimeUpdate$: Observable<number>): void {
        let popupConfigs = this.popupService.getPopupConfigsForEpisode(episodeInfo);

        videoTimeUpdate$.pipe(
            throttleTime(1000)
        ).subscribe(timeStamp => {
            const configToOpen = popupConfigs.find(config => this.isTimeToOpenPopup(config, timeStamp, episodeInfo))

            if(configToOpen) {
                this.popupController.openPopup(configToOpen.pupupKey, video, episodeInfo);
                popupConfigs = popupConfigs.filter(config => config.pupupKey !== configToOpen.pupupKey);
            }
        });
    }

    private isTimeToOpenPopup(popupConfig: PopupConfig, currentTime: number, episodeInfo: SeriesEpisode): boolean {
        if(popupConfig.openFromStart) {
            return currentTime > popupConfig.timeToOpen;
        }

        const timeFromEnd = episodeInfo.duration - currentTime
        return popupConfig.timeToOpen > timeFromEnd
    }

    private setActiveTimestamp({ key }: SeriesEpisode, videoTimeUpdate$: Observable<number>): void {
        videoTimeUpdate$.pipe(
            throttleTime(1000),
        ).subscribe(timestamp => {
            this.store.dispatch(setTimestampForSeriesEpisodeAction({seriesEpisodeKey: key, timestamp }));
        })
    }

    private setStartTime(video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        const series = this.store.selectSync(getSeriesByKey, episodeInfo.seriesKey);
        if (Boolean(episodeInfo.timestamp)) {
            video.currentTime = episodeInfo.timestamp;
        } else if (series.isStartTimeConfigured && series.scipStartTime) {
            video.currentTime = series.scipStartTime;
        }
    }
}
