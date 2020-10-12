import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { ProvidorService } from '../services/providor.service';
import { PortalService } from '../services/portalService';
import { WindowService } from '../services/window.service';
import { ipcMain } from 'electron';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import {
    createStartEpisodeMessage,
    RecaptchaRecognizedMessage
} from '../../browserMessages/messages/background.messages';
import { PORTALS } from '../../store/enums/portals.enum';
import { MessageService } from '../../shared/services/message.service';
import { RootBackgroundController } from './root-background.controller';


@injectable()
export class TestController {


    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(BACKGROUND_TYPES.ProvidorService) private readonly providorService: ProvidorService,
                @inject(BACKGROUND_TYPES.PortalService) private readonly portalService: PortalService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
                @inject(BACKGROUND_TYPES.RootController) private readonly rootController: RootBackgroundController,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService) {
    }

    public initializeHandler(): void {
        ipcMain.handle(MessageType.TEST_BACKGROUND_START_TEST_EPISODE_OVER_BS,
            (event, message: RecaptchaRecognizedMessage): void => {
                this.rootController.startEpisodeHandler(createStartEpisodeMessage('24-S5-E4', PORTALS.BS));
            });
    }
}
