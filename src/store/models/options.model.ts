import { LANGUAGE } from '../enums/language.enum';

export interface Options {
    episodesToPlay: number;
    timeTillSetEndtimePopup: number;
    timeForEndtimeCountdown: number;
    scipIfNoVideo: boolean;
    defaultLanguage: LANGUAGE;
}
