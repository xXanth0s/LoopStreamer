import Vue from 'vue';
import SeriesEpisode from '../../../store/models/series-episode.model';
import VideoButtonComponent from './VideoButtonComponent.vue';

export const addVideoButtons = function(episodeInfo: SeriesEpisode): void {
    const containerId = 'ls-video-buttons';
    const buttonContainer = document.createElement('div');
    buttonContainer.setAttribute('id', containerId);
    buttonContainer.innerHTML = `<ls-video-buttons></ls-video-buttons>`;

    document.body.appendChild(buttonContainer);

    new Vue({
        render: h => h(VideoButtonComponent, {
            props: {
                episodeInfo
            }
        }),
        components: { ButtonComponent: VideoButtonComponent }
    }).$mount(`#${containerId}`);
};

