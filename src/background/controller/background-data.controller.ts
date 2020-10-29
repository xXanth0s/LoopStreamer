import { inject, injectable } from 'inversify';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { PortalController } from './portal.controller';
import { VideoController } from './video.controller';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import { WindowService } from '../services/window.service';
import { ipcMain } from 'electron';
import { SeriesService } from '../services/series.service';
import {
    GetContinuableEpisodeMessage,
    HasNextEpisodeMessage
} from '../../browserMessages/messages/background-data.messages';

@injectable()
export class BackgroundDataController {

    constructor(@inject(BACKGROUND_TYPES.PortalController) private readonly portalController: PortalController,
                @inject(BACKGROUND_TYPES.VideoController) private readonly videoController: VideoController,
                @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(BACKGROUND_TYPES.SeriesService) private readonly seriesService: SeriesService,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService) {
    }

    public initializeHandler(): void {
        ipcMain.handle(MessageType.BACKGROUND_DATA_GET_CONTINUABLE_EPISODE, (event, message: GetContinuableEpisodeMessage) => {
            return this.seriesService.getContinuableEpisodeForSeries(message.payload);
        });
        ipcMain.handle(MessageType.BACKGROUND_DATA_GET_HAS_NEXT_EPISODE, async (event, message: HasNextEpisodeMessage) => {
            const nextEpisode = await this.seriesService.getNextEpisode(message.payload);
            return Boolean(nextEpisode);
        });
    }
}
