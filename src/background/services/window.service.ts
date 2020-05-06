import { inject, injectable } from 'inversify';
import { BrowserWindow } from 'electron';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { getVideoTabId } from '../../store/selectors/control-state.selector';
import { getActivePortalTabId } from '../../store/selectors/portals.selector';
import path from "path";
import os from 'os';
import { BrowserWindowConstructorOptions } from 'electron';

@injectable()
export class WindowService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    private _videoWindow: BrowserWindow;
    private _portalWindow: BrowserWindow;

    public addReduxDevTools(): void {
        // BrowserWindow.addDevToolsExtension(
        //     path.join(os.homedir(), '/AppData/Local/Google/Chrome/User Data/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0')
        // )
    }

    public getPortalWindow(): BrowserWindow {
        const id = this.store.selectSync(getActivePortalTabId);
        if (id) {
            return BrowserWindow.fromId(this.store.selectSync(getActivePortalTabId));
        }
        return null;
    }

    public openWindow(href: string, config = { nodeIntegration: false, visible: false }): BrowserWindow {
        const windowConfig = this.getDefaultConfig(config);
        const window = new BrowserWindow(windowConfig);
        window.loadURL(href);
        window.webContents.openDevTools();
        return window;
    }

    private getDefaultConfig(config = { nodeIntegration: false, visible: false }): BrowserWindowConstructorOptions {
        return {
            width: 1800,
            height: 1200,
            show: config.visible,
            webPreferences: {
                nodeIntegration: config.nodeIntegration,
                preload: path.resolve(__dirname, 'js', 'content.js'),
            },
        }
    }

}
