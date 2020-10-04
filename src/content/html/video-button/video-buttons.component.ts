import Vue from 'vue';
import SeriesEpisode from '../../../store/models/series-episode.model';
import ButtonComponent from './ButtonComponent.vue';
// @ts-ignore
import styles from '../../styles/content.scss';

export const addVideoButtons = function(episodeInfo: SeriesEpisode): void {
    styles.use();
    const containerId = 'ls-video-buttons';
    const buttonContainer = document.createElement('div');
    buttonContainer.setAttribute('id', containerId);
    buttonContainer.innerHTML = `<ls-video-buttons></ls-video-buttons>`;

    document.body.appendChild(buttonContainer);

    new Vue({
        render: h => h(ButtonComponent, {
            props: {
                episodeInfo
            }
        }),
        components: { ButtonComponent }
    }).$mount('#ls-video-buttons')
};

