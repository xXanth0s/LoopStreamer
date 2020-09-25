import { inject, injectable } from 'inversify';
import { BrowserWindow, BrowserWindowConstructorOptions, Session } from 'electron';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { getVideoTabId } from '../../store/selectors/control-state.selector';
import { getActivePortalTabId } from '../../store/selectors/portals.selector';

@injectable()
export class WindowService {

    private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36';

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
            return BrowserWindow.fromId(id);
        }
        return null;
    }

    public getProvidorWindow(): BrowserWindow {
        const id = this.store.selectSync(getVideoTabId);
        if (id) {
            return BrowserWindow.fromId(id);
        }
        return null;
    }

    public setDefaultUserAgent(session: Session): void {
        session.setUserAgent(this.userAgent);
    }

    public openWindow(href: string, config = { nodeIntegration: false, visible: false }): BrowserWindow {
        const windowConfig = this.getDefaultConfig(config);
        const window = new BrowserWindow(windowConfig);
        window.loadURL(href);
        window.webContents.openDevTools();
        window.webContents.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36';
        return window;
    }

    private getDefaultConfig(config = { nodeIntegration: false, visible: false }): BrowserWindowConstructorOptions {
        return {
            width: 1800,
            height: 1200,
            show: config.visible,
            frame: true,
            webPreferences: {
                nodeIntegration: true,
                // preload: path.resolve(__dirname, 'js', 'content.js'),
                webSecurity: false,
                allowRunningInsecureContent: true,
                experimentalFeatures: true,
                contextIsolation: !config.nodeIntegration
            },
        }
    }

}
