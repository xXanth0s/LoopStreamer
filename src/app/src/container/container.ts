import { Container } from 'inversify';
import 'reflect-metadata';
import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
import { BrowserStoreService } from '../../../shared/services/browser-store.service';
import { StoreService } from '../../../shared/services/store.service';
import { ControllerType } from '../../../browserMessages/enum/controller.type';
import { MessageService } from '../../../shared/services/message.service';
import { MovieDBService } from '../../../shared/services/movie-db.service';

export const optionsContainer = new Container();

// store
optionsContainer.bind(SHARED_TYPES.Store).to(BrowserStoreService).inSingletonScope();
optionsContainer.bind(SHARED_TYPES.StoreService).to(StoreService).inSingletonScope();
optionsContainer.bind(SHARED_TYPES.ControllerType).toConstantValue(ControllerType.OPTIONS);
optionsContainer.bind(SHARED_TYPES.MovieDBService).to(MovieDBService).inSingletonScope();

// shared
optionsContainer.bind(SHARED_TYPES.MessageService).to(MessageService).inSingletonScope();

