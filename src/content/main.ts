import { inversifyContentContainer } from './container/container';
import { RootContentController } from './controller/root-content.controller';
import { CONTENT_TYPES } from './container/CONTENT_TYPES';
import { initBrowserStore } from '../store/store/browser-store';
import { isDevelopment } from '../utils/environment.utils';
import { TestController } from './controller/test.controller';

initBrowserStore()
const contentController = inversifyContentContainer.get<RootContentController>(CONTENT_TYPES.RootController);

contentController.init();

if(isDevelopment()) {
    inversifyContentContainer.get<TestController>(CONTENT_TYPES.TestController).initialize();
}

console.log('content script loaded')
