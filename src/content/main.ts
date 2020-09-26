import { inversifyContentContainer } from './container/container';
import { RootContentController } from './controller/root-content.controller';
import { CONTENT_TYPES } from './container/CONTENT_TYPES';
import { initBrowserStore } from '../store/store/browser-store';

initBrowserStore()
const contentController = inversifyContentContainer.get<RootContentController>(CONTENT_TYPES.RootController);

contentController.init();

console.log('content script loaded')
