import { WindowType } from '../enums/window-type.enum';
import { Windows } from 'webextension-polyfill-ts';
import WindowState = Windows.WindowState;

export class BrowserWindowStateModel {
    width?: number;
    height?: number;
    key: WindowType;
    windowState?: WindowState
    windowId: number;
}
