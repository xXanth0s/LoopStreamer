import { Container } from 'inversify';
import 'reflect-metadata';
import { MessageService } from '../../shared/services/message.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { BrowserStoreService } from '../../shared/services/browser-store.service';
import { StoreService } from '../../shared/services/store.service';
import { ControllerType } from '../../browserMessages/enum/controller.type';
import { BurningSeriesController } from '../controller/portals/burning-series.controller';
import { VivoController } from '../controller/providors/vivo.controller';
import { CONTENT_TYPES } from './CONTENT_TYPES';
import { VideoController } from '../controller/video.controller';
import { RootContentController } from '../controller/root-content.controller';
import { PortalFactory } from '../factories/portal.factory';
import { NotificationService } from '../services/notification.service';
import { TestController } from '../controller/test.controller';
import { RecaptchaService } from '../services/recaptcha.service';
import { PopupService } from '../services/popup.service';
import { PopupController } from '../controller/popup.controller';
import { Logger } from '../../shared/services/logger';
import { MIXDropController } from '../controller/providors/mixdrop.controller';
import { NotificationController } from '../controller/notification.controller';

const inversifyContentContainer = new Container();

// Shared
inversifyContentContainer.bind(SHARED_TYPES.MessageService).to(MessageService).inSingletonScope();
inversifyContentContainer.bind(SHARED_TYPES.Store).to(BrowserStoreService).inSingletonScope();
inversifyContentContainer.bind(SHARED_TYPES.StoreService).to(StoreService).inSingletonScope();
inversifyContentContainer.bind(SHARED_TYPES.LoggingService).to(Logger).inSingletonScope();
inversifyContentContainer.bind(SHARED_TYPES.ControllerType).toConstantValue(ControllerType.PROVIDOR);

// Services
inversifyContentContainer.bind(CONTENT_TYPES.PortalService).to(PortalFactory).inSingletonScope();
inversifyContentContainer.bind(CONTENT_TYPES.RecaptchaService).to(RecaptchaService).inSingletonScope();
inversifyContentContainer.bind(CONTENT_TYPES.NotificationService).to(NotificationService).inSingletonScope();
inversifyContentContainer.bind(CONTENT_TYPES.PopupService).to(PopupService).inSingletonScope();

// Controllers
inversifyContentContainer.bind(CONTENT_TYPES.RootController).to(RootContentController).inSingletonScope();
inversifyContentContainer.bind(CONTENT_TYPES.VideoController).to(VideoController).inSingletonScope();
inversifyContentContainer.bind(CONTENT_TYPES.PopupController).to(PopupController).inSingletonScope();
inversifyContentContainer.bind(CONTENT_TYPES.NotificationController).to(NotificationController).inSingletonScope();
inversifyContentContainer.bind(CONTENT_TYPES.TestController).to(TestController).inSingletonScope();

// Portal Controllers
inversifyContentContainer.bind(CONTENT_TYPES.BurningSeries).to(BurningSeriesController).inSingletonScope();

// Providor Controllers
inversifyContentContainer.bind(CONTENT_TYPES.Vivo).to(VivoController).inSingletonScope();
inversifyContentContainer.bind(CONTENT_TYPES.MIXDrop).to(MIXDropController).inSingletonScope();

export { inversifyContentContainer };
