import Vue from 'vue';
import { SeriesEpisode } from '../../../store/models/series-episode.model';
import VideoButtonComponent from './VideoButtonComponent.vue';

export function addVideoButtons(episodeKey: SeriesEpisode['key']): void {
    const containerId = 'ls-video-buttons';
    const buttonContainer = document.createElement('div');
    buttonContainer.setAttribute('id', containerId);
    buttonContainer.innerHTML = '<ls-video-buttons></ls-video-buttons>';

    document.body.appendChild(buttonContainer);

    new Vue({
        render: h => h(VideoButtonComponent, {
            props: {
                episodeKey,
            },
        }),
        components: { ButtonComponent: VideoButtonComponent },
    }).$mount(`#${containerId}`);
}
