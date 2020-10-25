import { injectable } from 'inversify';
import { IziToast, IziToastPosition, IziToastSettings, IziToastTransitionIn, IziToastTransitionOut } from 'izitoast';
import Toastr from 'toastr2';

export class NotificationService {

    private readonly defaultConfig: IziToastSettings = {
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

    private _iziToast: IziToast = null;

    private get iziToast(): Promise<IziToast> {
        return new Promise<IziToast>(resolve => {

            resolve({});
            // if (this._iziToast) {
            //     resolve(this._iziToast);
            //     return;
            // }
            //
            // // @ts-ignore
            // import(/* webpackChunkName: "izitoast" */ 'izitoast').then((iziToast: IziToast) => {
            //     this._iziToast = iziToast;
            //     resolve(this._iziToast);
            // });
        });
    }

    public async openSetStartTimePopup(setStartTime: () => void, doNotSetStarttime: () => void): Promise<void> {
        const iziToast = await this.iziToast;
        iziToast.show({
            ...this.defaultConfig,
            title: 'Intro definieren',
            message: 'Die zu überspringenden Zeit setzen',
            buttons: [
                [ '<button>Jetzt setzen</button>', (instance, toast) => {
                    setStartTime();
                    this.closeToast(instance, toast);
                }, false ],
                [ '<button>Nicht überspringen</button>', (instance, toast) => {
                    doNotSetStarttime();
                    this.closeToast(instance, toast);
                }, false ]
            ]
        });
    }

    public async openSetEndTimePopup(timeoutSeconds: number, setEndTime: () => void, doNotSetStarttime: () => void, continueFn: () => void): Promise<void> {
        const iziToast = await this.iziToast;
        iziToast.show({
            ...this.defaultConfig,
            timeout: timeoutSeconds * 1000,
            resetOnHover: false,
            title: 'Outro definieren',
            message: 'Die zu überspringenden Zeit setzen',
            onClosed: continueFn,
            buttons: [
                [ '<button>Jetzt setzen</button>', (instance, toast) => {
                    setEndTime();
                    this.closeToast(instance, toast);
                }, false ],
                [ '<button>Nicht überspringen</button>', (instance, toast) => {
                    doNotSetStarttime();
                    this.closeToast(instance, toast);
                }, false ]
            ]
        });
    }

    public async openEndTimePopup(timeoutSeconds: number, continueFn: () => void, cancel: () => void): Promise<void> {
        const iziToast = await this.iziToast;
        iziToast.show({
            ...this.defaultConfig,
            timeout: timeoutSeconds * 1000,
            progressBar: true,
            title: 'Video Beendet',
            message: 'Nächste Episode',
            onClosed: continueFn,
            buttons: [
                [ '<button>Fortsetzen</button>', (instance, toast) => {
                    continueFn();
                    this.closeToast(instance, toast);
                }, false ],
                [ '<button>Nicht überspringen</button>', (instance, toast) => {
                    cancel();
                    this.closeToast(instance, toast);
                }, false ]
            ]
        });
    }


    public async openEpisodeLimitReachedPopup(continueFn: () => void, cancel: () => void): Promise<void> {
        const iziToast = await this.iziToast;
        iziToast.show({
            ...this.defaultConfig,
            timeout: 0,
            progressBar: false,
            title: 'Serie fortsetzen',
            message: 'Wollen Sie die Serie fortsetzen?',
            onClosed: continueFn,
            buttons: [
                [ '<button>Fortsetzen</button>', (instance, toast) => {
                    continueFn();
                    this.closeToast(instance, toast);
                }, false ],
                [ '<button>Abbrechen</button>', (instance, toast) => {
                    cancel();
                    this.closeToast(instance, toast);
                }, false ]
            ]
        });
    }

    public static async openTestPopup(): Promise<void> {

        const toastr = new Toastr();
        toastr.info('test')
    }

    private closeToast(instance: IziToast, htmlElement: HTMLDivElement): void {
        instance.hide({ transitionOut: 'fadeOut' }, htmlElement, 'button');
    }
}
