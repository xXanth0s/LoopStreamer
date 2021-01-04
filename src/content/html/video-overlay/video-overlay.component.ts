import Vue from 'vue';
import { SeriesEpisode } from '../../../store/models/series-episode.model';
import VideoOverlayComponent from './VideoOverlayComponent.vue';

export function addVideoOverlay(episodeKey: SeriesEpisode['key']): void {
    const containerId = 'ls-video-overlay';
    const buttonContainer = document.createElement('div');
    buttonContainer.setAttribute('id', containerId);
    buttonContainer.innerHTML = '<ls-video-buttons></ls-video-buttons>';

    document.body.appendChild(buttonContainer);

    new Vue({
        render: h => h(VideoOverlayComponent, {
            props: {
                episodeKey,
            },
        }),
        components: { ButtonComponent: VideoOverlayComponent },
    }).$mount(`#${containerId}`);
}
