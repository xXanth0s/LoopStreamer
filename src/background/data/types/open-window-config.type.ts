import { Referrer } from 'electron';

export type OpenWindowConfig = {
    nodeIntegration?: boolean;
    visible?: boolean;
    httpReferrer?: string | Referrer;
    fullscreen?: boolean;
    manipulateSession?: boolean;
    preloadScript?: boolean
}
