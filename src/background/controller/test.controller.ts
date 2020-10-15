import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { ProvidorService } from '../services/providor.service';
import { PortalService } from '../services/portalService';
import { WindowService } from '../services/window.service';
import { BrowserWindow, ipcMain } from 'electron';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import { createStartEpisodeMessage } from '../../browserMessages/messages/background.messages';
import { PORTALS } from '../../store/enums/portals.enum';
import { MessageService } from '../../shared/services/message.service';
import { RootBackgroundController } from './root-background.controller';
import {
    createStartTestRecaptchaMessage,
    createTestNotificationMessage,
    OpenTestPageMessage,
    StartTestEpisodeOverBSMessage
} from '../../browserMessages/messages/test.messages';
import { WindowController } from './window.controller';
import { waitTillPageLoadFinished } from '../../utils/rxjs.util';
import Website from '../../store/models/website';
import { setWindowIdForWindowTypeAction } from '../../store/reducers/control-state.reducer';
import { WindowType } from '../../store/enums/window-type.enum';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


@injectable()
export class TestController {


    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(BACKGROUND_TYPES.ProvidorService) private readonly providorService: ProvidorService,
                @inject(BACKGROUND_TYPES.PortalService) private readonly portalService: PortalService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
                @inject(BACKGROUND_TYPES.RootController) private readonly rootController: RootBackgroundController,
                @inject(BACKGROUND_TYPES.WindowController) private readonly windowController: WindowController,
                @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService) {
    }

    public initializeHandler(): void {
        ipcMain.handle(MessageType.TEST_BACKGROUND_START_TEST_EPISODE_OVER_BS,
            (event, message: StartTestEpisodeOverBSMessage): void => {
                this.rootController.startEpisodeHandler(createStartEpisodeMessage('24-S5-E4', PORTALS.BS));
            });

        ipcMain.handle(MessageType.TEST_BACKGROUND_START_RECAPTCHA,
            (event, message: StartTestEpisodeOverBSMessage): void => {
                this.startTestPage().subscribe(window => {
                    this.store.dispatch(setWindowIdForWindowTypeAction({windowId: window.id, windowType: WindowType.PORTAL}))
                    this.messageService.sendMessageToPortalTab(createStartTestRecaptchaMessage());
                })
            });

        ipcMain.handle(MessageType.TEST_BACKGROUND_OPEN_TEST_PAGE,
            (event, message: OpenTestPageMessage): void => {
                this.startTestPage().subscribe(window => {
                    this.store.dispatch(setWindowIdForWindowTypeAction({windowId: window.id, windowType: WindowType.PORTAL}))
                    this.messageService.sendMessageToPortalTab(createTestNotificationMessage());
                })
            });
    }

    private startTestPage(): Observable<BrowserWindow> {
        const testWebsite: Website = {
            baseUrl: 'localhost',
            urlRegex: 'localhost',
        };

        return this.windowController.openLinkForWebsite(testWebsite, 'http://localhost:4200/').pipe(
            waitTillPageLoadFinished(),
            tap(window => window.show())
        );
    }
}
