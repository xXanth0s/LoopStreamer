import { inversifyContainer } from './container';
import { BACKGROUND_TYPES } from './BACKGROUND_TYPES';
import { PortalController } from '../controller/portal.controller';
import { VideoController } from '../controller/video.controller';
import { WindowService } from '../services/window.service';

export function getPortalController(): PortalController {
    return inversifyContainer.get<PortalController>(BACKGROUND_TYPES.PortalController);
}

export function getVideoController(): VideoController {
    return inversifyContainer.get<VideoController>(BACKGROUND_TYPES.VideoController);
}

export function getWindowService(): WindowService {
    return inversifyContainer.get<WindowService>(BACKGROUND_TYPES.WindowService);
}
