import {ipcRenderer} from 'electron'
import backgroundStore from '../store/store/background-store';
import { MessageService } from '../shared/services/message.service';
import browserStore from '../store/store/browser-store';


console.log(22)
ipcRenderer.on('test', () => {
    const t = browserStore;
    console.log('i asssm the content script');
});




