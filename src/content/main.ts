import { inversifyContentContainer } from './container/container';
import { RootContentController } from './controller/root-content.controller';
import { CONTENT_TYPES } from './container/CONTENT_TYPES';
import { TestController } from './controller/test.controller';
import { environment } from '../environments/environment';

const contentController = inversifyContentContainer.get<RootContentController>(CONTENT_TYPES.RootController);

contentController.init();

if (environment.isDev) {
    inversifyContentContainer.get<TestController>(CONTENT_TYPES.TestController).initialize();
}

console.log('content script loaded');
