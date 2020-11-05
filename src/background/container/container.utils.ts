import { SeriesService } from '../services/series.service';
import { inversifyContainer } from './container';
import { BACKGROUND_TYPES } from './BACKGROUND_TYPES';
import { PortalController } from '../controller/portal.controller';
import { VideoController } from '../controller/video.controller';

export function getSeriesService(): SeriesService {
    return inversifyContainer.get<SeriesService>(BACKGROUND_TYPES.SeriesService);
}

export function getPortalController(): PortalController {
    return inversifyContainer.get<PortalController>(BACKGROUND_TYPES.PortalController);
}

export function getVideoController(): VideoController {
    return inversifyContainer.get<VideoController>(BACKGROUND_TYPES.VideoController);
}
