import { WindowType } from '../enums/window-type.enum';
import { Windows } from 'webextension-polyfill-ts';
import WindowState = Windows.WindowState;

export class BrowserWindowStateModel {
    previousWidth?: number;
    previousHeight?: number;
    width?: number;
    height?: number;
    key: WindowType;
    windowState?: WindowState
    windowId: number;
}
