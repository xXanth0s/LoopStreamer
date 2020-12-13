import { app } from 'electron';
import { BACKGROUND_TYPES } from './container/BACKGROUND_TYPES';
import { RootBackgroundController } from './controller/root-background.controller';
import { inversifyContainer } from './container/container';
import { TestController } from './controller/test.controller';
import { environment } from '../environments/environment';

app.commandLine.appendSwitch('disable-http-cache');
async function initialize(): Promise<void> {
    const rootController = inversifyContainer.get<RootBackgroundController>(BACKGROUND_TYPES.RootController);

    rootController.initializeHandler();
    rootController.openApp();
    if (environment.isDev) {
        const testController = inversifyContainer.get<TestController>(BACKGROUND_TYPES.TestController);
        testController.initializeHandler();
    }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // if (win === null) {
    //    createWindow();
    // }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    initialize();
});
//
// // Exit cleanly on request from parent process in development mode.
// if (isDevelopment) {
//    if (process.platform === 'win32') {
//       process.on('message', (data) => {
//          if (data === 'graceful-exit') {
//             app.quit();
//          }
//       });
//    } else {
//       process.on('SIGTERM', () => {
//          app.quit();
//       });
//    }
// }
