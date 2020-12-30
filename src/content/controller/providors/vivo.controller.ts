import { inject, injectable } from 'inversify';
import { IProvidorController } from './providor.controller.interface';
import { CONTENT_TYPES } from '../../container/CONTENT_TYPES';
import { VideoController } from '../video.controller';
import { SeriesEpisode } from '../../../store/models/series-episode.model';
import { addFullscreenClass } from '../../ustils/dom.utils';

@injectable()
export class VivoController implements IProvidorController {
    constructor(@inject(CONTENT_TYPES.VideoController) private readonly videoController: VideoController) {
    }

    /* eslint-disable max-len */
    private readonly videoSelector = (): HTMLVideoElement => document.querySelector('div.stream-content > div > div > video');
    private readonly lightSwitchButton = (): HTMLVideoElement => document.querySelector('.light-switch');
    private readonly videoContainer = (): HTMLVideoElement => document.querySelector('div.stream-content > div');

    /* eslint-enable max-len */

    public startVideo(seriesEpisodeKey: SeriesEpisode['key']): boolean {
        const videoElement = this.videoSelector();
        if (videoElement) {
            addFullscreenClass(this.videoContainer());
            this.videoController.startVideo(videoElement, seriesEpisodeKey);
            // eslint-disable-next-line no-unused-expressions
            this.lightSwitchButton()?.remove();
            return true;
        }
        return false;
    }
}
