import {inversifyContentContainer} from './container/container';
import {RootContentController} from './controller/root-content.controller';
import {CONTENT_TYPES} from './container/CONTENT_TYPES';
import {ipcRenderer, ipcMain} from 'electron'
import { of, timer } from 'rxjs';
import { MessageType } from '../browserMessages/enum/message-type.enum';
import { GetActiveVideoInformation } from '../browserMessages/messages/portal.messages';


// inversifyContentContainer.get<RootContentController>(CONTENT_TYPES.RootController).init();

ipcRenderer.on('test', async event => {
    await of(timer(500)).toPromise()
    return 42
})
ipcRenderer.on(MessageType.PORTAL_GET_VIDEO_INFORMATION, (event, arg: GetActiveVideoInformation) => {
    event.sender.send(`${arg.type}_reply`, 'test')
    console.log('message sent to background')
})
