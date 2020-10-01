import { injectable } from 'inversify';

@injectable()
export class NotificationService {
    //
    // private readonly defaultConfig: IziToastSettings  = {
    //     transitionIn: 'fadeInLeft' as IziToastTransitionIn,
    //     transitionOut: 'fadeOutRight' as IziToastTransitionOut,
    //     position: 'topRight' as IziToastPosition,
    //     layout: 2,
    //     resetOnHover: true,
    //     message: 'Loopstreamer',
    //     theme: 'dark',
    //     color: 'grey',
    //     close: true,
    //     maxWidth: 300,
    //     timeout: 0,
    // };
    //
    // public openSetStartTimePopup(setStartTime: () => void, doNotSetStarttime: () => void): void {
    //     iziToast.show({
    //         ...this.defaultConfig,
    //         title: 'Intro definieren',
    //         message: 'Die zu überspringenden Zeit setzen',
    //         buttons: [
    //             ['<button>Jetzt setzen</button>', () => {
    //                 iziToast.destroy();
    //                 setStartTime();
    //             }, false],
    //             ['<button>Nicht überspringen</button>', () => {
    //                 iziToast.destroy();
    //                 doNotSetStarttime();
    //             }, false]
    //         ]
    //     });
    // }
    //
    // public openSetEndTimePopup(setEndTime: () => void, doNotSetStarttime: () => void): void {
    //     iziToast.show({
    //         ...this.defaultConfig,
    //         title: 'Outro definieren',
    //         message: 'Die zu überspringenden Zeit setzen',
    //         buttons: [
    //             ['<button>Jetzt setzen</button>', () => {
    //                 iziToast.destroy();
    //                 setEndTime();
    //             }, false],
    //             ['<button>Nicht überspringen</button>', () => {
    //                 iziToast.destroy();
    //                 doNotSetStarttime();
    //             }, false]
    //         ]
    //     });
    // }
    //
    // public openEndTimePopup(continueFn: () => void, cancel: () => void): void {
    //     iziToast.show({
    //         ...this.defaultConfig,
    //         timeout: 10000,
    //         progressBar: true,
    //         title: 'Video Beendet',
    //         message: 'Nächste Episode',
    //         onClosed: continueFn,
    //         buttons: [
    //             ['<button>Fortsetzen</button>', () => {
    //                 iziToast.destroy();
    //                 continueFn();
    //             }, false],
    //             ['<button>Nicht überspringen</button>', () => {
    //                 iziToast.destroy();
    //                 cancel();
    //             }, false]
    //         ]
    //     });
    // }
}
