import { inject, injectable } from 'inversify';
import { BrowserWindow } from 'electron';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { getVideoTabId } from '../../store/selectors/control-state.selector';
import { getActivePortalTabId } from '../../store/selectors/portals.selector';
import path from "path";
import { BrowserWindowConstructorOptions } from 'electron';

@injectable()
export class WindowService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    private _videoWindow: BrowserWindow;
    private _portalWindow: BrowserWindow;

    public getVideoWindow(): BrowserWindow {
        return BrowserWindow.fromId(this.store.selectSync(getVideoTabId));
    }

    public setVideoWindow(videoWindow: BrowserWindow): void {
    }

    public getPortalWindow(): BrowserWindow {
        return BrowserWindow.fromId(this.store.selectSync(getActivePortalTabId));
    }

    public setPortalWindow(portalWindow: BrowserWindow): void {
        this._portalWindow = portalWindow;
    }

    public openWindow(href: string, enableNode: boolean = false): BrowserWindow {
        const config = this.getDefaultConfig(enableNode);
        const window = new BrowserWindow(config);
        window.loadURL(href);
        return window;
    }

    private getDefaultConfig(nodeIntegration: boolean = false): BrowserWindowConstructorOptions {
        return {
            width: 1800,
            height: 1200,
            webPreferences: {
                nodeIntegration,
                nodeIntegrationInSubFrames: false,
                preload: path.resolve(__dirname, 'js', 'content.js'),
            },
        }
    }

}
