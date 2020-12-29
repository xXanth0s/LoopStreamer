import { inject, injectable } from 'inversify';
import { BrowserWindow, ipcMain } from 'electron';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import { MessageService } from '../../shared/services/message.service';
import {
    createStartTestRecaptchaMessage,
    createTestNotificationMessage,
} from '../../browserMessages/messages/test.messages';
import { WindowController } from './window.controller';
import { waitTillPageLoadFinished } from '../../utils/rxjs.util';
import { Website } from '../../store/models/website';
import { setWindowIdForWindowTypeAction } from '../../store/reducers/control-state.reducer';
import { WindowType } from '../../store/enums/window-type.enum';

@injectable()
export class TestController {
    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
                @inject(BACKGROUND_TYPES.WindowController) private readonly windowController: WindowController) {
    }

    public initializeHandler(): void {
        ipcMain.handle(MessageType.TEST_BACKGROUND_START_RECAPTCHA, (): void => {
            this.startTestPage().subscribe(window => {
                this.messageService.sendMessageToBrowserWindow(window.id,
                    createStartTestRecaptchaMessage());
            });
        });

        ipcMain.handle(MessageType.TEST_BACKGROUND_OPEN_TEST_PAGE, (): void => {
            this.startTestPage().subscribe(window => {
                this.store.dispatch(setWindowIdForWindowTypeAction({
                    windowId: window.id,
                    windowType: WindowType.VIDEO,
                }));
                this.messageService.sendMessageToBrowserWindow(window.id,
                    createTestNotificationMessage());
            });
        });

        ipcMain.handle(MessageType.TEST_BACKGROUND_SHOW_ALL_WINDOWS, (): void => {
            BrowserWindow.getAllWindows().forEach(window => window.show());
        });
    }

    private startTestPage(): Observable<BrowserWindow> {
        const testWebsite: Website = {
            baseUrl: 'localhost',
            urlRegex: 'localhost',
        };

        return this.windowController.openLinkForWebsite(testWebsite, 'http://localhost:4200/').pipe(
            waitTillPageLoadFinished(),
            tap(window => window.show()),
        );
    }
}
