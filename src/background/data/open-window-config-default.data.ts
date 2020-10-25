import { OpenWindowConfig } from '../services/window.service';
import { environment } from '../../environments/environment';

export const DefaultOpenWindowConfig: Required<OpenWindowConfig> = {
    fullscreen: false,
    httpReferrer: null,
    nodeIntegration: false,
    preloadScript: true,
    visible: environment.showNewWindows
}
