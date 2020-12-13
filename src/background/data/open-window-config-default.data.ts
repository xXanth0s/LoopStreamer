import { environment } from '../../environments/environment';
import { OpenWindowConfig } from './types/open-window-config.type';

export const DefaultOpenWindowConfig: Required<OpenWindowConfig> = {
    mutePage: true,
    fullscreen: false,
    httpReferrer: null,
    nodeIntegration: false,
    preloadScript: true,
    visible: environment.showNewWindows,
    manipulateSession: false,
    width: 1600,
    height: 900,
    resizable: true,
};
