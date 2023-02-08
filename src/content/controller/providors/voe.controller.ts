import { inject, injectable } from 'inversify';
import { IProvidorController } from './providor.controller.interface';
import { CONTENT_TYPES } from '../../container/CONTENT_TYPES';
import { VideoController } from '../video.controller';
import { SeriesEpisode } from '../../../store/models/series-episode.model';

@injectable()
export class VoeController implements IProvidorController {
    constructor(@inject(CONTENT_TYPES.VideoController) private readonly videoController: VideoController) {
    }

    /* eslint-disable max-len */
    private readonly videoSelector = (): HTMLVideoElement => document.querySelector('video');

    /* eslint-enable max-len */

    public startVideo(seriesEpisodeKey: SeriesEpisode['key']): boolean {
        const videoElement = this.videoSelector();
        if (videoElement) {
            this.videoController.startVideo(videoElement, seriesEpisodeKey);
            // eslint-disable-next-line no-unused-expressions
            return true;
        }
        return false;
    }
}
