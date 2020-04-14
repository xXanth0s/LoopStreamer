import Electron from 'electron';
import ipcRenderer = Electron.ipcRenderer;

console.log(22)
ipcRenderer.on('test', () => {
  debugger;
  console.log('i am the content script');
});


