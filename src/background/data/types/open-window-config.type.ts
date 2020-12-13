import { Referrer } from 'electron';

export type OpenWindowConfig = {
    mutePage?: boolean;
    nodeIntegration?: boolean;
    visible?: boolean;
    httpReferrer?: string | Referrer;
    fullscreen?: boolean;
    manipulateSession?: boolean;
    preloadScript?: boolean;
    width?: number;
    height?: number;
    resizable?: boolean
}
