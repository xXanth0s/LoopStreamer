import { OpenWindowConfig } from '../services/window.service';

export const DefaultOpenWindowConfig: Required<OpenWindowConfig> = {
    fullscreen: false,
    httpReferrer: null,
    nodeIntegration: false,
    preloadScript: true,
    visible: false
}
