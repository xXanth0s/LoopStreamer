import { Windows } from 'webextension-polyfill-ts';
import { WindowType } from '../enums/window-type.enum';
import WindowState = Windows.WindowState;

export class BrowserWindowStateModel {
    width?: number;
    height?: number;
    key: WindowType;
    windowState?: WindowState
    windowId: number;
}
