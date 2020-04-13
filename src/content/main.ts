import ipcRenderer = Electron.ipcRenderer;

ipcRenderer.on('test', () => {
  console.log('i am the content script');
});
