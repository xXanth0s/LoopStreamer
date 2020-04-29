import { inject, injectable } from 'inversify';
import BrowserWindow = Electron.BrowserWindow;
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { getVideoTabId } from '../../store/selectors/control-state.selector';
import { getActivePortalTabId } from '../../store/selectors/portals.selector';

@injectable()
export class WindowService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {}

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

}
