import {ipcRenderer} from 'electron'



console.log(22)
ipcRenderer.on('test', () => {
    console.log('i asssm the content script');
});




