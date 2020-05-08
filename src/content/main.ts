import { inversifyContentContainer } from './container/container';
import { ipcRenderer } from 'electron'
import { MessageType } from '../browserMessages/enum/message-type.enum';
import { GetProvidorLinkForEpisode } from '../browserMessages/messages/portal.messages';
import { RootContentController } from './controller/root-content.controller';
import { CONTENT_TYPES } from './container/CONTENT_TYPES';
import { initBrowserStore } from '../store/store/browser-store';
import { PortalService } from './services/portal.service';

initBrowserStore()
const contentController = inversifyContentContainer.get<RootContentController>(CONTENT_TYPES.RootController);

contentController.init();

