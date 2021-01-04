import { inject, injectable } from 'inversify';
import {
    fromEvent, merge, Observable, Subject, timer,
} from 'rxjs';
import {
    distinctUntilChanged, filter, first, takeUntil, tap,
} from 'rxjs/operators';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { CONTENT_TYPES } from '../container/CONTENT_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { addVideoButtons } from '../html/video-button/video-buttons.component';
import { PopupController } from './popup.controller';
import { ControllerType } from '../../browserMessages/enum/controller.type';
import { SeriesEpisode } from '../../store/models/series-episode.model';
import { getSeriesByKey, getSeriesForEpisode } from '../../store/selectors/series.selector';
import {
    seriesEpisodeStartedAction,
    setSeriesEpisodeTimeStampAction,
} from '../../store/reducers/series-episode.reducer';
import { getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';
import { isVideoPictureInPicture } from '../../store/selectors/app-control-state.selector';
import { setPictureInPictureAction } from '../../store/reducers/control-state.reducer';
import { addClassForVideoInVideoClass, getPictureInPictureState } from '../ustils/dom.utils';
import {
    createStartVideoInVideoMessage,
    createToggleWindowFullscreenMessage,
} from '../../browserMessages/messages/background.messages';
import { addVideoOverlay } from '../html/video-overlay/video-overlay.component';
import { getDefaultLanguage } from '../../store/selectors/options.selector';
import { getSeriesEpisodeTitle } from '../../store/utils/series.utils';

@injectable()
export class VideoController {
    constructor(
        @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
        @inject(CONTENT_TYPES.PopupController) private readonly popupController: PopupController,
        @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
    ) {
        this.messageService.setControllerType(ControllerType.PROVIDOR);
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
            this.preventVideoFullscreen();
            this.setVideoTitle(seriesEpisodeKey);
        }
    }

    private setVideoTitle(episodeKey: SeriesEpisode['key']): void {
        const language = this.store.selectSync(getDefaultLanguage);
        const episode = this.store.selectSync(getSeriesEpisodeByKey, episodeKey);
        const series = this.store.selectSync(getSeriesForEpisode, episodeKey);

        window.document.title = `${series.titles[language]} ${getSeriesEpisodeTitle(episode)}`;
    }

    private async onVideoStarted(video: HTMLVideoElement, seriesEpisodeKey: SeriesEpisode['key']): Promise<void> {
        this.videoStarted$.next();
        await this.store.dispatch(seriesEpisodeStartedAction({
            seriesEpisodeKey,
            duration: video.duration,
        }));

        this.store.select(getSeriesEpisodeByKey, seriesEpisodeKey).pipe(
            first(),
        ).subscribe(episodeData => {
            const videoTimeUpdate$ = this.getVideoTimeChanges(video);

            this.setStartTime(video, episodeData);
            this.popupController.openPopupsForVideo(video, seriesEpisodeKey, videoTimeUpdate$);
            this.setActiveTimestamp(episodeData, videoTimeUpdate$);
            this.setPictureInPictureState(video);
            addVideoButtons(episodeData.key);
            addVideoOverlay(episodeData.key);
        });
    }

    private getVideoTimeChanges(video: HTMLVideoElement): Observable<number> {
        const onTimeSub$ = new Subject<number>();
        video.ontimeupdate = () => onTimeSub$.next(Math.trunc(video.currentTime));

        return onTimeSub$.pipe(
            distinctUntilChanged(),
        );
    }

    private startErrorTimer(timeout: number): void {
        timer(timeout).pipe(
            takeUntil(this.videoStarted$),
        ).subscribe(() => {
            console.error('VivoController: Problem with starting the video');
        });
    }

    private setActiveTimestamp({ key }: SeriesEpisode, videoTimeUpdate$: Observable<number>): void {
        videoTimeUpdate$.pipe(
            tap((time) => console.log('timeUpdate', time)),
            filter(time => time % 5 === 0),
        ).subscribe(timestamp => {
            this.store.dispatch(setSeriesEpisodeTimeStampAction({ seriesEpisodeKey: key, timestamp }));
        });
    }

    private setStartTime(video: HTMLVideoElement, episodeInfo: SeriesEpisode): void {
        const series = this.store.selectSync(getSeriesByKey, episodeInfo.seriesKey);
        if (Boolean(episodeInfo.timestamp) && !episodeInfo.isFinished) {
            video.currentTime = episodeInfo.timestamp;
        } else if (series.isStartTimeConfigured && series.scipStartTime) {
            video.currentTime = series.scipStartTime;
        }
    }

    private setPictureInPictureState(video: HTMLVideoElement): void {
        addClassForVideoInVideoClass(video);
        let isProgrammatically = false;

        this.store.selectBehaviour(isVideoPictureInPicture).subscribe(isPictureInPictureValue => {
            isProgrammatically = true;
            if (isPictureInPictureValue) {
                this.messageService.sendMessageToBackground(createStartVideoInVideoMessage());
            } else if (getPictureInPictureState()) {
                // @ts-ignore
                document.exitPictureInPicture();
            }
        });

        merge(
            fromEvent(video, 'enterpictureinpicture'),
            fromEvent(video, 'leavepictureinpicture'),
        ).subscribe(() => {
            if (!isProgrammatically) {
                const isPictureInPicture = getPictureInPictureState();
                this.store.dispatch(setPictureInPictureAction({ isPictureInPicture }));
            }

            isProgrammatically = false;
        });
    }

    private preventVideoFullscreen(): void {
        document.addEventListener('fullscreenchange', async () => {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                await this.messageService.sendMessageToBackground(createToggleWindowFullscreenMessage());
            }
        });
    }
}
