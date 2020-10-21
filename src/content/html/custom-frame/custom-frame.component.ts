import Vue from 'vue';
import CustomFrame from './CustomFrame.vue';

export function addCustomFrame() {
    const containerId = 'ls-custom-frame';
    const customFrameContainer = document.createElement('div');
    customFrameContainer.setAttribute('id', containerId);
    customFrameContainer.innerHTML = `<window-control-buttons></window-control-buttons>`;


    document.body.appendChild(customFrameContainer);
    new Vue({
        render: h => h(CustomFrame),
        components: { CustomFrame }
    }).$mount(`#${containerId}`);
}
