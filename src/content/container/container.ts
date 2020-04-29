import {Container} from 'inversify';
import "reflect-metadata";
import {SHARED_TYPES} from '../../shared/constants/SHARED_TYPES';
import {MessageService} from '../../shared/services/message.service';
import {StoreService} from '../../shared/services/store.service';
import {BurningSeriesController} from '../controller/portals/burning-series.controller';
import {CONTENT_TYPES} from './CONTENT_TYPES';
import {PortalService} from '../services/portal.service';
import {RootContentController} from '../controller/root-content.controller';
import {ProvidorService} from '../services/providor.service';
import {VivoController} from '../controller/providors/vivo.controller';
import {VideoController} from '../controller/video.controller';
import {NotificationService} from '../services/notification.service';
import {BrowserStoreService} from '../../shared/services/browser-store.service';
import { ControllerType } from '../../browserMessages/enum/controller.type';

const inversifyContentContainer = new Container();

// Shared
inversifyContentContainer.bind(SHARED_TYPES.MessageService).to(MessageService).inSingletonScope();
inversifyContentContainer.bind(SHARED_TYPES.Store).to(BrowserStoreService).inSingletonScope();
inversifyContentContainer.bind(SHARED_TYPES.StoreService).to(StoreService).inSingletonScope();
inversifyContentContainer.bind(SHARED_TYPES.ControllerType).toConstantValue(ControllerType.PROVIDOR);

// Services
inversifyContentContainer.bind(CONTENT_TYPES.PortalService).to(PortalService).inSingletonScope();
inversifyContentContainer.bind(CONTENT_TYPES.ProvidorService).to(ProvidorService).inSingletonScope();
inversifyContentContainer.bind(CONTENT_TYPES.NotificationService).to(NotificationService).inSingletonScope();

// Controllers
inversifyContentContainer.bind(CONTENT_TYPES.RootController).to(RootContentController).inSingletonScope();
inversifyContentContainer.bind(CONTENT_TYPES.VideoController).to(VideoController).inSingletonScope();

// Portal Controllers
inversifyContentContainer.bind(CONTENT_TYPES.BurningSeries).to(BurningSeriesController).inSingletonScope();

// Providor Controllers
inversifyContentContainer.bind(CONTENT_TYPES.Vivo).to(VivoController).inSingletonScope();

export {inversifyContentContainer};
