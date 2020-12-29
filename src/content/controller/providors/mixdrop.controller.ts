import { inject, injectable } from 'inversify';
import { IProvidorController } from './providor.controller.interface';
import { CONTENT_TYPES } from '../../container/CONTENT_TYPES';
import { VideoController } from '../video.controller';
import { SeriesEpisode } from '../../../store/models/series-episode.model';

@injectable()
export class MIXDropController implements IProvidorController {
    constructor(@inject(CONTENT_TYPES.VideoController) private readonly videoController: VideoController) {
    }

    public startVideo(seriesEpisodeKey: SeriesEpisode['key']): boolean {
        const videoElement = this.videoSelector();
        if (videoElement) {
            this.playButton().click();
            this.videoController.startVideo(videoElement, seriesEpisodeKey);
            return true;
        }
        return false;
    }

    private readonly videoSelector = (): HTMLVideoElement => document.querySelector('video');

    private readonly playButton = (): HTMLButtonElement => document.querySelector('.vjs-big-play-button');
}
