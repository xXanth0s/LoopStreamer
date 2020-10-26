import { injectable } from 'inversify';
import iziToast, {
    IziToast,
    IziToastPosition,
    IziToastSettings,
    IziToastTransitionIn,
    IziToastTransitionOut
} from '../../../custom_frameworks/izitoast/1.4.0';

@injectable()
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

    public openSetStartTimePopup(setStartTime: () => void, doNotSetStarttime: () => void): void {
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

    public openSetEndTimePopup(timeoutSeconds: number, setEndTime: () => void, doNotSetStarttime: () => void, continueFn: () => void): void {
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

    public openEndTimePopup(timeoutSeconds: number, continueFn: () => void): void {
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
                    this.closeToast(instance, toast);
                }, false ]
            ]
        });
    }


    public openEpisodeLimitReachedPopup(continueFn: () => void): void {
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
                    this.closeToast(instance, toast);
                }, false ]
            ]
        });
    }

    public openTestPopup(): void {
        iziToast.show({
            ...this.defaultConfig,
            timeout: 0,
            progressBar: false,
            title: 'Serie fortsetzen',
            message: 'Wollen Sie die Serie fortsetzen?'
        });
    }

    private closeToast(instance: IziToast, htmlElement: HTMLDivElement): void {
        instance.hide({
            transitionOut: 'fadeOut', onClosed: () => {
            }
        }, htmlElement, 'button');
    }
}
