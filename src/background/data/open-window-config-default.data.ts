import { OpenWindowConfig } from '../services/window.service';

export const DefaultOpenWindowConfig: Required<OpenWindowConfig> = {
    fullscreen: false,
    httpReferrer: null,
    nodeIntegration: false,
    preloadScript: true,
    visible: Boolean(+process.env.SHOW_NEW_WINDOWS)
}
