import { Container } from 'inversify';
import 'reflect-metadata';
import { BACKGROUND_TYPES } from './BACKGROUND_TYPES';
import { RootBackgroundController } from '../controller/root-background.controller';
import { VideoController } from '../controller/video.controller';
import { PortalController } from '../controller/portal.controller';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { BackgroundStoreService } from '../services/background-store.service';
import { ProvidorService } from '../services/providor.service';
import { WindowController } from '../controller/window.controller';
import { ControllerType } from '../../browserMessages/enum/controller.type';
import { WindowService } from '../services/window.service';
import { SeriesService } from '../../shared/services/series.service';
import { PortalService } from '../services/portalService';
import { TestController } from '../controller/test.controller';

const inversifyContainer = new Container();

// shared
inversifyContainer.bind(SHARED_TYPES.MessageService).to(MessageService).inSingletonScope();
inversifyContainer.bind(SHARED_TYPES.ControllerType).toConstantValue(ControllerType.BACKGROUND);

// store
inversifyContainer.bind(SHARED_TYPES.StoreService).to(StoreService).inSingletonScope();
inversifyContainer.bind(SHARED_TYPES.Store).to(BackgroundStoreService).inSingletonScope();
inversifyContainer.bind(SHARED_TYPES.SeriesService).to(SeriesService).inSingletonScope();

// services
inversifyContainer.bind(BACKGROUND_TYPES.ProvidorService).to(ProvidorService).inSingletonScope();
inversifyContainer.bind(BACKGROUND_TYPES.PortalService).to(PortalService).inSingletonScope();
inversifyContainer.bind(BACKGROUND_TYPES.WindowService).to(WindowService).inSingletonScope();

//controller
inversifyContainer.bind(BACKGROUND_TYPES.VideoController).to(VideoController).inSingletonScope();
inversifyContainer.bind(BACKGROUND_TYPES.PortalController).to(PortalController).inSingletonScope();
inversifyContainer.bind(BACKGROUND_TYPES.WindowController).to(WindowController).inSingletonScope();
inversifyContainer.bind(BACKGROUND_TYPES.RootController).to(RootBackgroundController).inSingletonScope();
inversifyContainer.bind(BACKGROUND_TYPES.TestController).to(TestController).inSingletonScope();

export {inversifyContainer};
