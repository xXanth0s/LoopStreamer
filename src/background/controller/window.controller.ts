import {inject, injectable} from 'inversify';
import {SHARED_TYPES} from '../../shared/constants/SHARED_TYPES';
import {StoreService} from '../../shared/services/store.service';
import {browser, Windows} from 'webextension-polyfill-ts';
import { getVideoTabId, getVideoWindowId, previousWindowState } from '../../store/selectors/control-state.selector';
import { setCurrentWindowStateAction, toggleWindowStateAction } from 'src/store/reducers/control-state.reducer';
import WindowState = Windows.WindowState;

@injectable()
export class WindowController {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    public async setCurrentWindowState(): Promise<void> {
        const activeWindow = await this.getVideoWindow();
        this.store.dispatch(setCurrentWindowStateAction(activeWindow?.state));
    }

    public async makeWindowFullscreen(): Promise<void> {
        const windowId = this.store.selectSync(getVideoWindowId);
        if (windowId) {
            // await chromme.windows.update(windowId, {state: 'fullscreen'});
            this.store.dispatch(setCurrentWindowStateAction('fullscreen'));
        } else {
            console.error('WindowController.makeWindowFullscreen: No videoWindowId provided');
        }
    }

    public async toggleWindowState(): Promise<void> {
        const activeWindow = await this.getVideoWindow();
        const isFullscreen = activeWindow.state === 'fullscreen';
        const oldWindowState = this.store.selectSync(previousWindowState);

        this.store.dispatch(toggleWindowStateAction());

        const newWindowState: WindowState = isFullscreen ? oldWindowState : 'fullscreen';

        // await chrome.windows.update(activeWindow.id, {state: newWindowState});
    }

    public async setDefaultState(): Promise<void> {
        const activeWindow = await browser.windows.getCurrent();
        const isFullscreen = activeWindow.state === 'fullscreen';
        const defaultWindowState = this.store.selectSync(previousWindowState);

        if (defaultWindowState !== 'fullscreen' && isFullscreen) {
            // await chrome.windows.update(activeWindow.id, {state: defaultWindowState});
        }
    }

    private async getVideoWindow(): Promise<Windows.Window> {
        const videoTabId = this.store.selectSync(getVideoTabId);
        const tab = await browser.tabs.get(videoTabId);
        const window = await browser.windows.get(tab?.windowId);
        if (!window) {
            console.error('WindowController: no video Window found');
        }

        return window
    }
}
