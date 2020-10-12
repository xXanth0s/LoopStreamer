import { injectable } from 'inversify';
import { IziToast, IziToastPosition, IziToastSettings, IziToastTransitionIn, IziToastTransitionOut } from 'izitoast';

@injectable()
export class NotificationService {

    private readonly defaultConfig: IziToastSettings  = {
        transitionIn: 'fadeInLeft' as IziToastTransitionIn,
        transitionOut: 'fadeOutRight' as IziToastTransitionOut,
        position: 'topRight' as IziToastPosition,
        layout: 2,
        resetOnHover: true,
        message: 'Loopstreamer',
        theme: 'dark',
        color: 'grey',
        close: true,
        maxWidth: 300,
        timeout: 0,
    };

    private _iziToast: IziToast = null

    private get iziToast(): Promise<IziToast> {
        return new Promise<IziToast>(resolve => {

            if(this._iziToast) {
                resolve(this._iziToast);
            } else {
                console.log('try to load izitoast')
                // @ts-ignore
                import(/* webpackChunkName: "iziToast" */ 'iziToast').then((iziToast: IziToast) => {
                    console.log('izitoast loaded')
                    this._iziToast = iziToast;
                    resolve(this._iziToast);
                })
            }

        })
    }

    public async openSetStartTimePopup(setStartTime: () => void, doNotSetStarttime: () => void): Promise<void> {
        const iziToast = await this.iziToast;
        iziToast.show({
            ...this.defaultConfig,
            title: 'Intro definieren',
            message: 'Die zu überspringenden Zeit setzen',
            buttons: [
                ['<button>Jetzt setzen</button>', () => {
                    iziToast.destroy();
                    setStartTime();
                }, false],
                ['<button>Nicht überspringen</button>', () => {
                    iziToast.destroy();
                    doNotSetStarttime();
                }, false]
            ]
        });
    }

    public async openSetEndTimePopup(setEndTime: () => void, doNotSetStarttime: () => void): Promise<void> {
        const iziToast = await this.iziToast;
        iziToast.show({
            ...this.defaultConfig,
            title: 'Outro definieren',
            message: 'Die zu überspringenden Zeit setzen',
            buttons: [
                ['<button>Jetzt setzen</button>', () => {
                    iziToast.destroy();
                    setEndTime();
                }, false],
                ['<button>Nicht überspringen</button>', () => {
                    iziToast.destroy();
                    doNotSetStarttime();
                }, false]
            ]
        });
    }

    public async openEndTimePopup(continueFn: () => void, cancel: () => void): Promise<void> {
        const iziToast = await this.iziToast;
        console.log('startingEndTimePopup')
        debugger
        iziToast.show({
            ...this.defaultConfig,
            timeout: 10000,
            progressBar: true,
            title: 'Video Beendet',
            message: 'Nächste Episode',
            onClosed: continueFn,
            buttons: [
                ['<button>Fortsetzen</button>', () => {
                    iziToast.destroy();
                    continueFn();
                }, false],
                ['<button>Nicht überspringen</button>', () => {
                    iziToast.destroy();
                    cancel();
                }, false]
            ]
        });
    }
}
