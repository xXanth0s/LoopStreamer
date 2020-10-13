import { inject, injectable } from 'inversify';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { MessageService } from '../../shared/services/message.service';
import { Observable, Subject } from 'rxjs';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { WindowController } from './window.controller';
import { getVideoWindowId } from '../../store/selectors/control-state.selector';
import { createStartVideoProvidorMessage } from '../../browserMessages/messages/providor.messages';
import { setLastWatchedSeriesAction } from '../../store/reducers/lastWatchedSeries.reducer';
import { setWindowIdForWindowTypeAction } from '../../store/reducers/control-state.reducer';
import { WindowService } from '../services/window.service';
import SeriesEpisode from '../../store/models/series-episode.model';
import { PROVIDORS } from '../../store/enums/providors.enum';
import { getProvidorForKey } from '../../store/selectors/providors.selector';
import { BrowserWindow } from 'electron';
import Providor from '../../store/models/providor.model';
import { waitTillPageLoadFinished } from '../../utils/rxjs.util';
import { WindowType } from '../../store/enums/window-type.enum';

@injectable()
export class VideoController {

    constructor(
        @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
        @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
        @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService,
        @inject(BACKGROUND_TYPES.WindowController) private readonly windowController: WindowController) {
    }

    private readonly takeUntil$ = new Subject();

    public async startVideo(seriesEpisode: SeriesEpisode, providorKey: PROVIDORS): Promise<void> {
        this.reset();
        const providor = this.store.selectSync(getProvidorForKey, providorKey);
        const activeWindow$ = this.openVideoUrl(seriesEpisode.providorLinks[providorKey], providor);

        activeWindow$.pipe(
            takeUntil(this.takeUntil$),
            takeUntil(this.store.playerHasStopped()),
        ).subscribe(async (window) => {
            this.messageService.sendMessageToVideoWindow(createStartVideoProvidorMessage(seriesEpisode.key, providorKey));
            this.store.dispatch(setLastWatchedSeriesAction(seriesEpisode.seriesKey));
            window.show();
        });
    }

    public reset(): void {
        const videoWindowId = this.store.selectSync(getVideoWindowId);
        if (videoWindowId) {
            const videoWindow = BrowserWindow.fromId(videoWindowId);
            this.windowService.closeWindow(videoWindow);
            this.store.dispatch(setWindowIdForWindowTypeAction({ windowId: null, windowType: WindowType.VIDEO }));
        }
    }

    private openVideoUrl(url: string, providor: Providor): Observable<BrowserWindow> {
        const window$ = this.windowController.openLinkForWebsite(providor, url);
        return window$.pipe(
            waitTillPageLoadFinished(),
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
