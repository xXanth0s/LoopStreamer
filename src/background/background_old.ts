import { app, BrowserWindow } from 'electron';
import { createProtocol, } from 'vue-cli-plugin-electron-builder/lib';
import * as path from 'path';
import { initStore } from '../store/store/background-store';
import { fromEvent } from 'rxjs';
import { createGetActiveVideoInformation } from '../browserMessages/messages/portal.messages';
import { inversifyContainer } from './container/container';
import { MessageService } from '../shared/services/message.service';
import { SHARED_TYPES } from '../shared/constants/SHARED_TYPES';
import { StoreService } from '../shared/services/store.service';
import { setVidoeTabIdAction } from '../store/reducers/control-state.reducer';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Scheme must be registered before the app is ready
// protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

function createWindow() {
  console.log('i am very stupid', __dirname);
  console.log('static variable', path.resolve(app.getAppPath(), 'js', 'content.js'));
  // Create the browser window.
  win = new BrowserWindow({
    width: 1800,
    height: 1200,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
      preload: path.resolve(__dirname, 'js', 'content.js'),
      // preload: 'C:\\Users\\maxis\\Projects\\LoopStreamer_UI\\src\\content.js',
    },
  });


  fromEvent(app, 'browser-window-created').subscribe( (data) => {
    console.log(`new webContents with Url`, data);
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    // win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    // win.loadURL('https://vivo.sx/97a0e64871');
    win.loadURL('https://bs.to');
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    win = null;
  });

    debugger
  win.webContents.on('dom-ready', () => {
    console.log(22);
    if (win) {
      const message = createGetActiveVideoInformation(true);
      const messageService = inversifyContainer.get<MessageService>(SHARED_TYPES.MessageService);
      const storeService = inversifyContainer.get<StoreService>(SHARED_TYPES.StoreService);
      storeService.dispatch(setVidoeTabIdAction(win.id))

      const test = async () => {
        const result = await messageService.sendMessageToVideoTab(message)
        console.log('answer from renderer', result);
      }

      test();
    }
  });
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
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
