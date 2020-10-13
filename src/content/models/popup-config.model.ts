import { Popup } from '../enum/popup.enum';

export class PopupConfig {
    pupupKey: Popup;
    mustBeOpened: boolean;
    openFromStart: boolean;
    timeToOpen: number;
}
