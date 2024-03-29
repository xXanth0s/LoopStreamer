import { inject, injectable } from 'inversify';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { BrowserWindow } from 'electron';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { MessageService } from '../../shared/services/message.service';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { WindowController } from './window.controller';
import { getWindowIdForWindowType } from '../../store/selectors/control-state.selector';
import { createStartVideoMessage } from '../../browserMessages/messages/providor.messages';
import { setWindowIdForWindowTypeAction } from '../../store/reducers/control-state.reducer';
import { WindowService } from '../services/window.service';
import { SeriesEpisode } from '../../store/models/series-episode.model';
import { getProvidorForKey } from '../../store/selectors/providors.selector';
import { waitTillPageLoadFinished } from '../../utils/rxjs.util';
import { WindowType } from '../../store/enums/window-type.enum';
import { Logger } from '../../shared/services/logger';
import { ProvidorLink } from '../models/providor-link.model';
import { PORTALS } from '../../store/enums/portals.enum';
import { VIDEO_PREPARATION_STATUS } from '../../browserMessages/enum/video-preparation-status.enum';

@injectable()
export class VideoController {
    constructor(
        @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
        @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
        @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService,
        @inject(BACKGROUND_TYPES.WindowController) private readonly windowController: WindowController) {
    }

    private readonly takeUntil$ = new Subject();

    public async startVideo(seriesEpisodeKey: SeriesEpisode['key'],
                            providorLink: ProvidorLink,
                            linkSourcePortal: PORTALS): Promise<boolean> {
        const oldWindowId = this.store.selectSync(getWindowIdForWindowType, WindowType.VIDEO);

        return new Promise<boolean>(resolve => {
            this.openVideoUrl(providorLink).pipe(
                takeUntil(this.takeUntil$),
                takeUntil(this.store.playerHasStopped()),
            ).subscribe(async window => {
                let videoStatus = VIDEO_PREPARATION_STATUS.NoVideo;
                try {
                    const message = createStartVideoMessage(seriesEpisodeKey, providorLink.providor, linkSourcePortal);
                    videoStatus = await this.messageService.sendMessageToVideoWindow(message);
                } catch (e) {
                    Logger.error('[VideoController->startVideo] Exception occurred', e);
                }

                if (videoStatus === VIDEO_PREPARATION_STATUS.VideoPreparing) {
                    return;
                }

                this.windowService.closeWindow(oldWindowId, true);

                if (videoStatus === VIDEO_PREPARATION_STATUS.VideoExists) {
                    window.show();
                    window.webContents.setAudioMuted(false);
                    resolve(true);
                }

                resolve(false);
            });
        });
    }

    private openVideoUrl({ link, providor }: ProvidorLink): Observable<BrowserWindow> {
        const website = this.store.selectSync(getProvidorForKey, providor);
        const window$ = this.windowController.openLinkForWebsite(website, link);
        return window$.pipe(
            waitTillPageLoadFinished(),
            tap(window => this.windowService.setOldWindowState(window.id, WindowType.VIDEO)),
            tap(window => this.setNewVideoWindow(window)),
            debounceTime(1000),
        );
    }

    private setNewVideoWindow(newVideoWindow: Electron.BrowserWindow): void {
        this.store.dispatch(setWindowIdForWindowTypeAction({
            windowId: newVideoWindow.id,
            windowType: WindowType.VIDEO,
        }));
    }
}
