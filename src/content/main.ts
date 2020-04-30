import { inversifyContentContainer } from './container/container';
import { ipcRenderer } from 'electron'
import { MessageType } from '../browserMessages/enum/message-type.enum';
import { GetActiveVideoInformation } from '../browserMessages/messages/portal.messages';
import { MessageService } from '../shared/services/message.service';
import { SHARED_TYPES } from '../shared/constants/SHARED_TYPES';


const messageService = inversifyContentContainer.get<MessageService>(SHARED_TYPES.MessageService)
// inversifyContentContainer.get<RootContentController>(CONTENT_TYPES.RootController).init();
console.log('initialized')
ipcRenderer.on(MessageType.PORTAL_GET_VIDEO_INFORMATION, (event, arg: GetActiveVideoInformation) => {
    messageService.replyToSender(arg, event.sender, { imageHref: 'image', key: 'testKey', title: 'test title' });
    event.sender.send(`${arg.type}_reply`, 'test')
    console.log('message sent to background')
})
