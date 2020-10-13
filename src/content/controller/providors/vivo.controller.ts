import { IProvidorController } from './providor.controller.interface';
import { inject, injectable } from 'inversify';
import { CONTENT_TYPES } from '../../container/CONTENT_TYPES';
import { VideoController } from '../video.controller';
import SeriesEpisode from '../../../store/models/series-episode.model';
import { addFullscreenClass } from '../../ustils/dom.utils';

@injectable()
export class VivoController implements IProvidorController {

    constructor(@inject(CONTENT_TYPES.VideoController) private readonly videoController: VideoController) {
    }

    private readonly videoSelector = (): HTMLVideoElement => document.querySelector('div.stream-content > div > div > video');
    private readonly lightSwitchButton = (): HTMLVideoElement => document.querySelector('.light-switch');
    private readonly videoContainer = (): HTMLVideoElement => document.querySelector('div.stream-content > div');

    public startVideo(seriesEpisodeKey: SeriesEpisode['key']): boolean {
        const videoElement = this.videoSelector();
        if (videoElement) {
            addFullscreenClass(this.videoContainer());
            this.videoController.startVideo(videoElement, seriesEpisodeKey);
            this.lightSwitchButton()?.remove();
            return true;
        } else {
            return false;
        }
    }
}
