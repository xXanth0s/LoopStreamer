import { inject, injectable } from 'inversify';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { MessageService } from '../../shared/services/message.service';
import { Observable, Subject } from 'rxjs';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { WindowController } from './window.controller';
import { getWindowIdForWindowType } from '../../store/selectors/control-state.selector';
import { createStartVideoMessage } from '../../browserMessages/messages/providor.messages';
import { setLastWatchedSeriesAction } from '../../store/reducers/lastWatchedSeries.reducer';
import {
    addAsyncInteractionAction,
    removeAsyncInteractionAction,
    setWindowIdForWindowTypeAction
} from '../../store/reducers/control-state.reducer';
import { WindowService } from '../services/window.service';
import SeriesEpisode from '../../store/models/series-episode.model';
import { getProvidorForKey } from '../../store/selectors/providors.selector';
import { BrowserWindow } from 'electron';
import { waitTillPageLoadFinished } from '../../utils/rxjs.util';
import { WindowType } from '../../store/enums/window-type.enum';
import { generateAsyncInteraction } from '../../store/store/async-interaction.util';
import { AsyncInteractionType } from '../../store/enums/async-interaction-type.enum';
import { Logger } from '../../shared/services/logger';
import { ProvidorLink } from '../models/providor-link.model';

@injectable()
export class VideoController {

    constructor(
        @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
        @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
        @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService,
        @inject(BACKGROUND_TYPES.WindowController) private readonly windowController: WindowController) {
    }

    private readonly takeUntil$ = new Subject();

    public async startVideo(seriesEpisodeKey: SeriesEpisode['key'], providorLink: ProvidorLink): Promise<boolean> {
        this.reset();

        const activeWindow$ = this.openVideoUrl(providorLink);

        const asyncInteractionModel = generateAsyncInteraction(AsyncInteractionType.VIDEO_OPEN_VIDEO, { seriesEpisode: seriesEpisodeKey });
        this.store.dispatch(addAsyncInteractionAction(asyncInteractionModel));

        return new Promise<boolean>(resolve => {
            activeWindow$.pipe(
                takeUntil(this.takeUntil$),
                takeUntil(this.store.playerHasStopped()),
            ).subscribe(async window => {
                let hasVideo = false;
                try {
                    hasVideo = await this.messageService.sendMessageToVideoWindow(createStartVideoMessage(seriesEpisodeKey, providorLink.providor));
                } catch (e) {
                    Logger.error('[VideoController->startVideo] Exception occured', e);
                } finally {
                    this.store.dispatch(removeAsyncInteractionAction(asyncInteractionModel.key));
                }

                if (hasVideo) {
                    this.store.dispatch(setLastWatchedSeriesAction(seriesEpisodeKey));
                    window.show();
                }

                resolve(hasVideo);
            });
        })

    }

    public reset(): void {
        const videoWindowId = this.store.selectSync(getWindowIdForWindowType, WindowType.VIDEO);
        if (videoWindowId) {
            this.store.dispatch(setWindowIdForWindowTypeAction({ windowId: null, windowType: WindowType.VIDEO }));
            this.windowService.closeWindow(videoWindowId, true);
        }
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
            windowType: WindowType.VIDEO
        }));
    }
}
