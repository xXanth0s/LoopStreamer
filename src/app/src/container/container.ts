import { Container } from 'inversify';
import 'reflect-metadata';
import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
import { BrowserStoreService } from '../../../shared/services/browser-store.service';
import { StoreService } from '../../../shared/services/store.service';
import { ControllerType } from '../../../browserMessages/enum/controller.type';
import { MessageService } from '../../../shared/services/message.service';
import { MovieDBService } from '../../../shared/services/movie-db.service';

export const appContainer = new Container();

// store
appContainer.bind(SHARED_TYPES.Store).to(BrowserStoreService).inSingletonScope();
appContainer.bind(SHARED_TYPES.StoreService).to(StoreService).inSingletonScope();
appContainer.bind(SHARED_TYPES.ControllerType).toConstantValue(ControllerType.OPTIONS);
appContainer.bind(SHARED_TYPES.MovieDBService).to(MovieDBService).inSingletonScope();

// shared
appContainer.bind(SHARED_TYPES.MessageService).to(MessageService).inSingletonScope();
