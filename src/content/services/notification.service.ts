import { inject, injectable } from 'inversify';
import iziToast, {
    IziToast,
    IziToastPosition,
    IziToastSettings,
    IziToastTransitionIn,
    IziToastTransitionOut,
} from '../../../custom_frameworks/izitoast/1.4.0';
import { NotificationButton, NotificationModel } from '../../store/models/notification.model';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';

// eslint-disable-next-line max-len
type iziToastButton = ([ string, (instance: IziToast, toast: HTMLDivElement, button: HTMLButtonElement, event: MouseEvent, inputs: Array<HTMLInputElement>) => void, boolean ]);

@injectable()
export class NotificationService {
    private readonly defaultConfig: IziToastSettings = {
        transitionIn: 'fadeInLeft' as IziToastTransitionIn,
        transitionOut: 'fadeOutRight' as IziToastTransitionOut,
        position: 'topRight' as IziToastPosition,
        layout: 2,
        resetOnHover: false,
        pauseOnHover: false,
        message: 'Loopstreamer',
        theme: 'dark',
        color: 'grey',
        close: true,
        maxWidth: 300,
        timeout: 0,
    };

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    public closeAllPopups(): void {
        iziToast.destroy();
    }

    public openNotification(notification: NotificationModel): void {
        const {
            title, text, closable, duration, buttons, closeAction,
        } = notification;

        iziToast.show(
            {
                ...this.defaultConfig,
                title,
                message: text,
                close: closable,
                timeout: duration,
                buttons: buttons.map(button => this.mapButton(button)),
                onClosed: () => {
                    if (closeAction) {
                        this.store.dispatch(closeAction);
                    }
                },
            },
        );
    }

    private mapButton({ text, clickAction }: NotificationButton): iziToastButton {
        return [ `<button>${text}</button>`, (instance, toast) => {
            this.store.dispatch(clickAction);
            this.closeToast(instance, toast);
        }, false ];
    }

    public openSetStartTimePopup(setStartTime: () => void,
                                 doNotSetStarttime: () => void,
                                 onClosedFn: () => void): void {
        iziToast.show({
            ...this.defaultConfig,
            title: 'Intro definieren',
            message: 'Die zu überspringenden Zeit setzen',
            onClosed: onClosedFn,
            buttons: [
                [ '<button>Jetzt setzen</button>', (instance, toast) => {
                    setStartTime();
                    this.closeToast(instance, toast);
                }, false ],
                [ '<button>Nicht überspringen</button>', (instance, toast) => {
                    doNotSetStarttime();
                    this.closeToast(instance, toast);
                }, false ],
            ],
        });
    }

    public openSetEndTimePopup(timeoutSeconds: number,
                               setEndTime: () => void,
                               doNotSetStarttime: () => void,
                               closedFn: () => void): void {
        iziToast.show({
            ...this.defaultConfig,
            timeout: timeoutSeconds * 1000,
            title: 'Outro definieren',
            message: 'Die zu überspringenden Zeit setzen',
            close: true,
            onClosed: closedFn,
            buttons: [
                [ '<button>Jetzt setzen</button>', (instance, toast) => {
                    setEndTime();
                    this.closeToast(instance, toast);
                }, false ],
                [ '<button>Nicht überspringen</button>', (instance, toast) => {
                    doNotSetStarttime();
                    this.closeToast(instance, toast);
                }, false ],
            ],
        });
    }

    public openEndTimePopup(timeoutSeconds: number, continueFn: () => void): void {
        iziToast.show({
            ...this.defaultConfig,
            timeout: timeoutSeconds * 1000,
            progressBar: true,
            close: false,
            title: 'Video Beendet',
            message: 'Nächste Episode',
            onClosed: continueFn,
            buttons: [
                [ '<button>Fortsetzen</button>', (instance, toast) => {
                    continueFn();
                    this.closeToast(instance, toast);
                }, false ],
                [ '<button>Abbrechen</button>', (instance, toast) => {
                    this.closeToast(instance, toast);
                }, false ],
            ],
        });
    }

    public openEpisodeLimitReachedPopup(continueFn: () => void): void {
        iziToast.show({
            ...this.defaultConfig,
            timeout: 0,
            progressBar: false,
            title: 'Serie fortsetzen',
            message: 'Wollen Sie die Serie fortsetzen?',
            close: false,
            buttons: [
                [ '<button>Fortsetzen</button>', (instance, toast) => {
                    continueFn();
                    this.closeToast(instance, toast);
                }, false ],
                [ '<button>Abbrechen</button>', (instance, toast) => {
                    this.closeToast(instance, toast);
                }, false ],
            ],
        });
    }

    public openVideoIsPreparingPopup(): void {
        iziToast.show({
            ...this.defaultConfig,
            timeout: 0,
            progressBar: false,
            title: 'Video wird vorbereitet',
            message: 'Das nächste Video wird Vorbereitet.',
        });
    }

    public openTestPopup(): void {
        iziToast.show({
            ...this.defaultConfig,
            timeout: 0,
            progressBar: false,
            title: 'Serie fortsetzen',
            message: 'Wollen Sie die Serie fortsetzen?',
        });
    }

    private closeToast(instance: IziToast, htmlElement: HTMLDivElement): void {
        instance.hide({
            transitionOut: 'fadeOut',
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onClosed: () => {
            },
        }, htmlElement, 'button');
    }
}
